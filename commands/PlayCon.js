const { ContextMenuCommandBuilder, ApplicationCommandType, EmbedBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, StreamType, NoSubscriberBehavior } = require('@discordjs/voice');
const { video_basic_info, stream, validate, playlist_info } = require('play-dl');
const ytsr = require('ytsr');
const fs = require('fs');

const { globaldata } = require('../data/global');

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('Play')
        .setType(ApplicationCommandType.Message),
    async execute(interaction) {
        play(interaction);
    },
};

async function play(interaction) {
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
    let link = msg.content;
    if (await validate(link) === 'search') {
        link = await search(interaction);
        if (!link) {
            const embed = new EmbedBuilder()
                .setTitle('Play')
                .setDescription('No results found!');
            return interaction.editReply({ embeds: [embed], ephemeral: true });
        }
    }
    const voicechannel = interaction.member.voice.channel;
    let embed = new EmbedBuilder()
        .setTitle('Play')
        .setDescription('You need to be in a voice channel to use this command!');
    if (!voicechannel) return interaction.editReply({ embeds: [embed] });
    const permissions = voicechannel.permissionsFor(interaction.client.user);
    if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
        const permissionsembed = new EmbedBuilder()
            .setTitle('Play')
            .setDescription('I need the permissions to join and speak in your voice channel!');
        return interaction.editReply({ embeds: [permissionsembed] });
    }
    const serverdata = globaldata.get(interaction.guild.id);
    embed = new EmbedBuilder()
        .setTitle('Play')
        .setDescription('This server is not enabled for music commands!');
    if (!serverdata) return interaction.editReply({ embeds: [embed] });
    const enabled = serverdata.textchannel.find((channel) => channel.id === interaction.channel.id);
    embed = new EmbedBuilder()
        .setTitle('Play')
        .setDescription('this channel is not enabled for music commands!');
    if (!enabled) return interaction.editReply({ embeds: [embed] });
    const song = {
        title: null,
        url: null,
        durationRaw: null,
        durationInSeconds: null,
        thumbnail: null,
        relatedVideos: null,
        requestedBy: null,
    };
    const playlist = {
        title: null,
        url: null,
        thumbnail: null,
        videos: [],
    };
    let sendasplaylist = false;
    if (await validate(link) === 'yt_video') {
        const songinfo = await video_basic_info(link);
        const thumbnail = songinfo.video_details.thumbnails[songinfo.video_details.thumbnails.length - 1];
        song.title = songinfo.video_details.title;
        song.url = songinfo.video_details.url;
        song.durationRaw = songinfo.video_details.durationRaw;
        song.durationInSeconds = songinfo.video_details.durationInSec;
        song.thumbnail = thumbnail.url;
        song.relatedVideos = songinfo.video_details.related_videos[0];
        song.requestedBy = interaction.user;
    } else if (await validate(link) === 'yt_playlist') {
        const playlistinfo = await playlist_info(link);
        playlist.title = playlistinfo.title;
        playlist.url = playlistinfo.url;
        playlist.thumbnail = playlistinfo.thumbnail;
        playlist.videos = playlistinfo.videos;
        embed = new EmbedBuilder()
            .setTitle('Play')
            .setDescription(`**${playlist.title}** playlist has been added!`)
            .setThumbnail(playlist.thumbnail)
            .setFooter({ text:`Requested by ${interaction.user.tag}`, iconURL:interaction.user.avatarURL() });
        interaction.editReply({ embeds: [embed] });
        for (let i = 0; i < playlist.videos.length; i++) {
            const songinfo = await video_basic_info(playlist.videos[i].url);
            const thumbnail = songinfo.video_details.thumbnails[songinfo.video_details.thumbnails.length - 1];
            song.title = songinfo.video_details.title;
            song.url = songinfo.video_details.url;
            song.durationRaw = songinfo.video_details.durationRaw;
            song.durationInSeconds = songinfo.video_details.durationInSec;
            song.thumbnail = thumbnail.url;
            song.relatedVideos = songinfo.video_details.related_videos[0];
            song.requestedBy = interaction.user;
            serverdata.songs.push(song);
        }
        sendasplaylist = true;
    } else if (await validate(link) === 'so_track') {
        embed = new EmbedBuilder()
            .setTitle('Play')
            .setDescription('Soundcloud is not supported yet!');
        return interaction.editReply({ embeds: [embed] });
        // const songinfo = await soundcloud(link);
        // song.title = songinfo.title;
        // song.url = songinfo.url;
        // song.durationRaw = songinfo.durationRaw;
        // song.durationInSeconds = songinfo.durationInSeconds;
        // song.thumbnail = songinfo.thumbnail;
        // song.requestedBy = interaction.user;
    } else if (await validate(link) === 'sp_track') {
        embed = new EmbedBuilder()
            .setTitle('Play')
            .setDescription('Spotify is not supported yet!');
        return interaction.editReply({ embeds: [embed] });
        // const songinfo = await spotify(link);
        // song.title = songinfo.title;
        // song.url = songinfo.url;
        // song.durationRaw = songinfo.durationRaw;
        // song.durationInSeconds = songinfo.durationInSeconds;
        // song.thumbnail = songinfo.thumbnail;
        // song.requestedBy = interaction.user;
    } else {
        embed = new EmbedBuilder()
            .setTitle('Play')
            .setDescription('Invalid link!');
        return interaction.editReply({ embeds: [embed] });
    }
    if (!serverdata.songs[0]) {
        if (sendasplaylist) {
            await playSong(interaction, serverdata.songs[0]);
            return;
        }
        serverdata.songs.push(song);
        embed = new EmbedBuilder()
            .setTitle('Play')
            .setDescription(`**${song.title}** has been added to the queue!\nSong duration: ${song.durationRaw}`)
            .setThumbnail(song.thumbnail)
            .setFooter({ text:`Requested by ${song.requestedBy.tag}`, iconURL:song.requestedBy.avatarURL() });
        interaction.editReply({ embeds: [embed] });
        try {
            const connection = joinVoiceChannel({
                channelId: voicechannel.id,
                guildId: voicechannel.guild.id,
                adapterCreator: voicechannel.guild.voiceAdapterCreator,
            });
            serverdata.connection = connection;
            await playSong(interaction, serverdata.songs[0]);
        } catch (error) {
            console.error(error);
            serverdata.song = [];
            const errorembed = new EmbedBuilder()
                .setTitle('Play')
                .setDescription(`There was an error: ${error}`);
            return interaction.editReply({ embeds: [errorembed], ephemeral: true });
        }
    } else {
        if (sendasplaylist) return;
        serverdata.songs.push(song);
        embed = new EmbedBuilder()
            .setTitle('Play')
            .setDescription(`**${song.title}** has been added to the queue!`);
        interaction.editReply({ embeds: [embed] });
    }
}

async function playSong(interaction, song) {
    const serverdata = globaldata.get(interaction.guild.id);
    serverdata.playing = true;
    if (!song) {
        serverdata.resource = null;
        serverdata.playing = false;
        serverdata.timervar = setTimeout(() => {
            serverdata.connection.destroy();
            serverdata.connection = null;
            serverdata.resource = null;
            serverdata.player = null;
            serverdata.playing = false;
            const mapToWrite = new Map(globaldata);
            mapToWrite.forEach((value) => {
                value.connection = null;
                value.player = null;
                value.resource = null;
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
        }, 30000);
        return;
    }
    const songstream = await stream(song.url, { discordPlayerCompatibility : true });
    serverdata.resource = createAudioResource(songstream.stream, { inputType: StreamType.Arbitrary, inlineVolume: true });
    serverdata.resource.volume.setVolume(serverdata.volume / 100);
    serverdata.player = createAudioPlayer({
        behaviors: {
            noSubscriber: NoSubscriberBehavior.Pause,
        },
    });
    serverdata.player.play(serverdata.resource);
    serverdata.connection.subscribe(serverdata.player);
    serverdata.player.on(AudioPlayerStatus.Idle, async () => {
        if (serverdata.loop) {
            playSong(interaction, serverdata.songs[0]);
        } else if (serverdata.autoplay) {
            if (serverdata.songs[1]) {
                serverdata.songs.shift();
                playSong(interaction, serverdata.songs[0]);
                return;
            }
            if (await validate(serverdata.songs[0].relatedVideos) === 'yt_video') {
                const relatedsong = await video_basic_info(serverdata.songs[0].relatedVideos);
                const resong = {
                    title: relatedsong.title,
                    url: relatedsong.url,
                    durationRaw: relatedsong.durationRaw,
                    durationInSeconds: relatedsong.durationInSeconds,
                    thumbnail: relatedsong.thumbnail,
                    relatedVideos: relatedsong.related_videos[0],
                    requestedBy: serverdata.songs[0].requestedBy,
                };
                serverdata.songs.shift();
                serverdata.songs.unshift(resong);
                playSong(interaction, serverdata.songs[0]);
            } else {
                serverdata.songs.shift();
                playSong(interaction, serverdata.songs[0]);
            }
        } else {
            serverdata.songs.shift();
            playSong(interaction, serverdata.songs[0]);
        }
    });
    serverdata.player.on(AudioPlayerStatus.Playing, () => {
        clearTimeout(serverdata.timervar);
        serverdata.playing = true;
    });
    serverdata.player.on(AudioPlayerStatus.AutoPaused, () => {
        serverdata.timervar = setTimeout(() => {
            serverdata.connection.destroy();
            serverdata.connection = null;
            serverdata.resource = null;
            serverdata.player = null;
            serverdata.playing = false;
            const mapToWrite = new Map(globaldata);
            mapToWrite.forEach((value) => {
                value.connection = null;
                value.player = null;
                value.resource = null;
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
        }, 30000);
    });
    const embed = new EmbedBuilder()
        .setTitle('Play')
        .setDescription(`Now playing **${song.title}**\nSong duration: ${song.durationRaw}`)
        .setThumbnail(song.thumbnail)
        .setFooter({ text:`Requested by ${song.requestedBy.tag}`, iconURL:song.requestedBy.avatarURL() });
    await interaction.channel.send({ embeds: [embed] });
}

async function search(interaction) {
    const msg = await interaction.channel.messages.fetch(interaction.targetId);
    const songname = msg.content;
    const song = await ytsr(songname, { limit: 1 });
    if (!song.items[0]) return false;
    const songurl = song.items[0].url;
    return songurl;
}
