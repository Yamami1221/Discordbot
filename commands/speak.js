const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Language } = require('node-nlp');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, StreamType } = require('@discordjs/voice');
const googleTTS = require('google-tts-api');
const fs = require('fs');

const language = new Language();

const { globalqueue } = require('../global.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('speak')
        .setDescription('Make the bot say something')
        .addStringOption(option =>
            option.setName('input')
                .setDescription('The input to say')
                .setMaxLength(200)
                .setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply();
        const serverQueue = globalqueue.get(interaction.guildId) || undefined;
        if (serverQueue?.veriChannel) {
            if (interaction.channel.id === serverQueue.veriChannel.id) {
                const embed = new EmbedBuilder()
                    .setTitle('Verification')
                    .setDescription('You cannot use this command in the verification channel');
                await interaction.editReply({ embeds: [embed], ephemeral: true });
                return;
            }
        }
        const input = interaction.options.getString('input');
        const voiceChannel = interaction.member.voice.channel;
        let embed = new EmbedBuilder()
            .setTitle('Speak')
            .setDescription('You need to be in a voice channel to use this command');
        if (!voiceChannel) return interaction.editReply({ embeds: [embed], ephemeral: true });
        const serverqueue = globalqueue.get(interaction.guild.id);
        embed = new EmbedBuilder()
            .setTitle('Speak')
            .setDescription('This server is not enabled for music commands');
        if (!serverqueue) return interaction.editReply({ embeds: [embed], ephemeral: true });
        const botmusicstate = serverqueue.playing;
        embed = new EmbedBuilder()
            .setTitle('Speak')
            .setDescription('The bot is playing music!');
        if (botmusicstate) return interaction.editReply({ embeds: [embed], ephemeral: true });
        try {
            await generateVoice(input);
        }
        catch (error) {
            console.log(error);
            embed = new EmbedBuilder()
                .setTitle('Speak')
                .setDescription('An error occured while generating the audio');
            return interaction.editReply({ embeds: [embed], ephemeral: true });
        }
        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        });
        serverqueue.connection = connection;
        serverqueue.playing = true;
        serverqueue.resource = createAudioResource('temp.mp3', { inputType: StreamType.Arbitrary, inlineVolume: true });
        serverqueue.resource.volume.setVolume(serverqueue.volume / 100);
        serverqueue.player = createAudioPlayer();
        serverqueue.player.play(serverqueue.resource);
        serverqueue.connection.subscribe(serverqueue.player);
        serverqueue.player.on(AudioPlayerStatus.Idle, () => {
            serverqueue.playing = false;
            serverqueue.resource = null;
            serverqueue.connection.destroy();
            interaction.deleteReply();
            if (fs.existsSync('temp.mp3')) {
                fs.unlinkSync('temp.mp3');
            }
        });
    },
};

async function generateVoice(input) {
    try {
        if (input.length > 200) input = input.substring(0, 200);
        const guess = await language.guess(
            input,
            ['en', 'ru', 'ja', 'ko', 'zh-cn', 'zh-tw', 'th'],
        );
        const lang = guess[0].alpha2;
        // get base64 audio
        const data = await googleTTS.getAudioBase64(input, {
            lang: lang,
            slow: false,
            host: 'https://translate.google.com',
            timeout: 10000,
        });
        // get audio file
        const buffer = Buffer.from(data, 'base64');
        fs.writeFileSync('temp.mp3', buffer, { encoding: 'base64' });
    } catch (err) {
        console.error(err.stack);
    }
}