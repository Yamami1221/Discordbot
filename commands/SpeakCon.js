const { ContextMenuCommandBuilder, ApplicationCommandType, EmbedBuilder } = require('discord.js');
const { Language } = require('node-nlp');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, StreamType } = require('@discordjs/voice');
const googleTTS = require('google-tts-api');
const fs = require('fs');

const language = new Language();

const { globaldata } = require('../data/global');

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('Speak')
        .setType(ApplicationCommandType.Message),
    async execute(interaction) {
        await interaction.deferReply();
        const serverData = globaldata.get(interaction.guildId) || undefined;
        if (serverData?.veriChannel) {
            if (interaction.channel.id === serverData.veriChannel.id) {
                const embed = new EmbedBuilder()
                    .setTitle('Verification')
                    .setDescription('You cannot use this command in the verification channel');
                await interaction.editReply({ embeds: [embed], ephemeral: true });
                return;
            }
        }
        const msg = await interaction.channel.messages.fetch(interaction.targetId);
        const input = msg.content;
        const voiceChannel = interaction.member.voice.channel;
        let embed = new EmbedBuilder()
            .setTitle('Speak')
            .setDescription('You need to be in a voice channel to use this command');
        if (!voiceChannel) return interaction.editReply({ embeds: [embed], ephemeral: true });
        const serverdata = globaldata.get(interaction.guild.id);
        embed = new EmbedBuilder()
            .setTitle('Speak')
            .setDescription('This server is not enabled for music commands');
        if (!serverdata) return interaction.editReply({ embeds: [embed], ephemeral: true });
        embed = new EmbedBuilder()
            .setTitle('Speak')
            .setDescription('The bot is playing music!');
        if (serverdata.playing) return interaction.editReply({ embeds: [embed], ephemeral: true });
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
        serverdata.connection = connection;
        serverdata.playing = true;
        serverdata.resource = createAudioResource('temp.mp3', { inputType: StreamType.Arbitrary, inlineVolume: true });
        serverdata.resource.volume.setVolume(serverdata.volume / 100);
        serverdata.player = createAudioPlayer();
        serverdata.player.play(serverdata.resource);
        serverdata.connection.subscribe(serverdata.player);
        serverdata.player.on(AudioPlayerStatus.Idle, () => {
            serverdata.timervar = setTimeout(() => {
                serverdata.connection.destroy();
                serverdata.resource = null;
                serverdata.player = null;
                serverdata.connection = null;
                serverdata.playing = false;
                interaction.deleteReply();
                if (fs.existsSync('temp.mp3')) {
                    fs.unlinkSync('temp.mp3');
                }
            }, 10000);
        });
        serverdata.player.on(AudioPlayerStatus.Playing, () => {
            clearTimeout(serverdata.timervar);
            serverdata.playing = true;
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