const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, StreamType } = require('@discordjs/voice');


const { globalqueue } = require('../global.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('soundboard')
        .setDescription('Show the soundboard')
        .setDMPermission(false),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const serverQueue = globalqueue.get(interaction.guildId);
        if (serverQueue.veriChannel) {
            if (interaction.channel.id === serverQueue.veriChannel.id) {
                const embed = new EmbedBuilder()
                    .setTitle('Verification')
                    .setDescription('You cannot use this command in the verification channel');
                await interaction.editReply({ embeds: [embed], ephemeral: true });
                return;
            }
        }
        const voiceChannel = interaction.member.voice.channel;
        let embed = new EmbedBuilder()
            .setTitle('Soundboard')
            .setDescription('You need to be in a voice channel to use this command');
        if (!voiceChannel) return interaction.editReply({ embeds: [embed], ephemeral: true });
        const serverqueue = globalqueue.get(interaction.guild.id);
        embed = new EmbedBuilder()
            .setTitle('Soundboard')
            .setDescription('This server is not enabled for music commands');
        if (!serverqueue) return interaction.editReply({ embeds: [embed], ephemeral: true });
        let enabled = false;
        for (let i = 0; i < serverqueue.textchannel.length; i++) {
            if (interaction.channel.id === serverqueue.textchannel[i].id) {
                enabled = true;
                break;
            }
        }
        embed = new EmbedBuilder()
            .setTitle('Soundboard')
            .setDescription('This channel is not enabled for music commands');
        if (!enabled) return interaction.editReply({ embeds: [embed], ephemeral: true });
        const botmusicstate = serverqueue.playing;
        embed = new EmbedBuilder()
            .setTitle('Soundboard')
            .setDescription('The bot is playing music!');
        if (botmusicstate) return interaction.editReply({ embeds: [embed], ephemeral: true });
        const data = [{ name: 'A', path:'./resource/sound/A.mp3' },
            { name: 'Angry Cat Meow', path:'./resource/sound/AngryCatMeow.mp3' },
            { name: 'Anime Wow', path:'./resource/sound/AnimeWow.mp3' },
            { name: 'Awww', path:'./resource/sound/Awww.mp3' },
            { name: 'Break', path:'./resource/sound/Break.mp3' },
            { name: 'Bye Have A Great Time', path:'./resource/sound/ByeHaveAGreatTime.mp3' },
            { name: 'Cartoon Hammer', path:'./resource/sound/CartoonHammer.mp3' },
            { name: 'Cartoon Running', path:'./resource/sound/CartoonRunning.mp3' },
            { name: 'Ding Sound', path:'./resource/sound/DingSound.mp3' },
            { name: 'Door Knock', path:'./resource/sound/DoorKnock.mp3' },
            { name: 'Dramatic Chipmunk', path:'./resource/sound/DramaticChipmunk.mp3' },
            { name: 'Error Sound', path:'./resource/sound/ErrorSound.mp3' },
            { name: 'Got Item', path:'./resource/sound/GotItem.mp3' },
            { name: 'Mario Coin', path:'./resource/sound/MarioCoin.mp3' },
            { name: 'MLG Airhorn', path:'./resource/sound/MLGAirhorn.mp3' },
            { name: 'Oh My', path:'./resource/sound/OhMy.mp3' },
            { name: 'Pew', path:'./resource/sound/Pew.mp3' },
            { name: 'Punch', path:'./resource/sound/Punch.mp3' },
            { name: 'Say What', path:'./resource/sound/SayWhat.mp3' },
            { name: 'Screaming Marmot', path:'./resource/sound/ScreamingMarmot.mp3' },
            { name: 'Slap', path:'./resource/sound/Slap.mp3' },
            { name: 'Take On Me', path:'./resource/sound/TakeOnMe.mp3' },
            { name: 'This Is Sparta', path:'./resource/sound/ThisIsSparta.mp3' },
            { name: 'Vine Boom Sound', path:'./resource/sound/VineBoomSound.mp3' },
            { name: 'Yeet', path:'./resource/sound/Yeet.mp3' }];
        const row1 = new ActionRowBuilder();
        for (let i = 0; i < 5; i++) {
            const button = new ButtonBuilder()
                .setLabel(data[i].name)
                .setStyle('Primary')
                .setCustomId(data[i].name);
            row1.addComponents(button);
        }
        const row2 = new ActionRowBuilder();
        for (let i = 5; i < 10; i++) {
            const button = new ButtonBuilder()
                .setLabel(data[i].name)
                .setStyle('Primary')
                .setCustomId(data[i].name);
            row2.addComponents(button);
        }
        const row3 = new ActionRowBuilder();
        for (let i = 10; i < 15; i++) {
            const button = new ButtonBuilder()
                .setLabel(data[i].name)
                .setStyle('Primary')
                .setCustomId(data[i].name);
            row3.addComponents(button);
        }
        const row4 = new ActionRowBuilder();
        for (let i = 15; i < 20; i++) {
            const button = new ButtonBuilder()
                .setLabel(data[i].name)
                .setStyle('Primary')
                .setCustomId(data[i].name);
            row4.addComponents(button);
        }
        const row5 = new ActionRowBuilder();
        for (let i = 20; i < 25; i++) {
            const button = new ButtonBuilder()
                .setLabel(data[i].name)
                .setStyle('Primary')
                .setCustomId(data[i].name);
            row5.addComponents(button);
        }
        await interaction.editReply({ content: 'Select a sound to play', components: [row1, row2, row3, row4, row5] });
        const filter = (i) => i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });
        collector.on('collect', async (i) => {
            let path;
            for (let j = 0; j < data.length; j++) {
                if (i.customId === data[j].name) {
                    path = data[j].path;
                    break;
                }
            }
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            });
            serverqueue.connection = connection;
            serverqueue.playing = true;
            serverqueue.resource = createAudioResource(path, { inputType: StreamType.Arbitrary, inlineVolume: true });
            serverqueue.resource.volume.setVolume(serverqueue.volume / 100);
            serverqueue.player = createAudioPlayer();
            serverqueue.player.play(serverqueue.resource);
            serverqueue.player.pause();
            serverqueue.connection.subscribe(serverqueue.player);
            serverqueue.player.unpause();
            serverqueue.player.on(AudioPlayerStatus.Idle, () => {
                serverqueue.playing = false;
                serverqueue.resource = null;
                serverqueue.connection.destroy();
            });
            i.deferUpdate();
        });
        collector.on('end', () => {
            const replied = interaction.fetchReply();
            if (replied) interaction.deleteReply();
        });
    },
};
