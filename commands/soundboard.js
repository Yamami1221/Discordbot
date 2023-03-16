const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, StreamType } = require('@discordjs/voice');
const fs = require('fs');


const { globaldata } = require('../data/global');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('soundboard')
        .setDescription('Show the soundboard')
        .setDMPermission(false),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
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
        const voiceChannel = interaction.member.voice.channel;
        let embed = new EmbedBuilder()
            .setTitle('Soundboard')
            .setDescription('You need to be in a voice channel to use this command');
        if (!voiceChannel) return interaction.editReply({ embeds: [embed], ephemeral: true });
        const serverdata = globaldata.get(interaction.guild.id);
        embed = new EmbedBuilder()
            .setTitle('Soundboard')
            .setDescription('This server is not enabled for music commands');
        if (!serverdata) return interaction.editReply({ embeds: [embed], ephemeral: true });
        const enabled = serverdata.textchannel.find((channel) => channel.id === interaction.channel.id);
        embed = new EmbedBuilder()
            .setTitle('Soundboard')
            .setDescription('This channel is not enabled for music commands');
        if (!enabled) return interaction.editReply({ embeds: [embed], ephemeral: true });
        const botmusicstate = serverdata.playing;
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
        const collector = interaction.channel.createMessageComponentCollector({ filter });
        collector.on('collect', async (i) => {
            const myinteraction = interaction;
            const path = data.find((x) => x.name === i.customId).path;
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            });
            serverdata.connection = connection;
            serverdata.playing = true;
            serverdata.resource = createAudioResource(path, { inputType: StreamType.Arbitrary, inlineVolume: true });
            serverdata.resource.volume.setVolume(serverdata.volume / 100);
            serverdata.player = createAudioPlayer();
            serverdata.player.play(serverdata.resource);
            serverdata.player.pause();
            serverdata.connection.subscribe(serverdata.player);
            serverdata.player.unpause();
            serverdata.player.on(AudioPlayerStatus.Idle, () => {
                serverdata.timervar = setTimeout(() => {
                    if (serverdata.connection) serverdata.connection.destroy();
                    serverdata.playing = false;
                    myinteraction.editReply({ content: 'Select a sound to play(Time Out)', components: [] });
                    collector.stop();
                }, 5000);
            });
            serverdata.player.on(AudioPlayerStatus.Playing, () => {
                clearTimeout(serverdata.timervar);
                serverdata.playing = true;
            });
            serverdata.player.on(AudioPlayerStatus.AutoPaused, () => {
                serverdata.timervar = setTimeout(() => {
                    serverdata.connection.destroy();
                    serverdata.playing = false;
                    myinteraction.editReply({ content: 'Select a sound to play(Time Out)', components: [] });
                    collector.stop();
                }, 5000);
            });
            await i.deferUpdate();
        });
        collector.on('end', async () => {
            serverdata.playing = false;
            serverdata.player = null;
            serverdata.resource = null;
            serverdata.connection = null;
            const premapToWrite = new Map([...globaldata]);
            const mapToWrite = new Map([...premapToWrite].map(([key, value]) => [key, Object.assign({}, value)]));
            mapToWrite.forEach((value) => {
                value.songs = [];
                value.connection = null;
                value.player = null;
                value.resource = null;
                value.timervar = null;
            });
            const objToWrite = Object.fromEntries(mapToWrite);
            const jsonToWrite = JSON.stringify(objToWrite);
            fs.writeFile('./data/data.json', jsonToWrite, err => {
                if (err) {
                    console.log('There has been an error saving your configuration data.');
                    console.log(err.message);
                    const errembed = new EmbedBuilder()
                        .setTitle('Enable')
                        .setDescription('There has been an error saving your configuration data.');
                    interaction.editReply({ embeds: [errembed] });
                    return;
                }
            });

        });
    },
};