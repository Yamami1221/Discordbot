const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, VoiceConnectionStatus, AudioPlayerStatus, StreamType, NoSubscriberBehavior } = require('@discordjs/voice');
const { video_basic_info, stream, spotify, soundcloud, validate, playlist_info, search, setToken, is_expired, refreshToken, getFreeClientID, SpotifyTrack, SoundCloudTrack } = require('play-dl');
const fs = require('fs');

const { globaldata, datapath } = require('../data/global');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play music by providing a link or search')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('The link or search query')
                .setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply();
        play(interaction);
    },
};

async function play(interaction) {
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
    let link = interaction.options.getString('query');
    const SOclientID = await getFreeClientID();
    await setToken({
        youtube : {
            cookie : process.env.YT_COOKIE, // Youtube cookie frow network tab developer tools in browser
        },
        spotify : {
            client_id: process.env.SPOTIFY_CLIENT_ID,
            client_secret: process.env.SPOTIFY_CLIENT_SECRET,
            refresh_token: process.env.SPOTIFY_REFRESH_TOKEN,
            market: 'TH',
        },
        soundcloud : {
            client_id: SOclientID,
        },
    });
    if (is_expired()) {
        await refreshToken();
    }
    if (await validate(link) === 'search') {
        link = await mysearch(interaction);
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
    clearTimeout(serverdata.timeout);
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
    try {
        if (await validate(link) === 'yt_video') {
            const songinfo = await video_basic_info(link);
            const thumbnail = songinfo.video_details.thumbnails[songinfo.video_details.thumbnails.length - 1];
            song.title = songinfo.video_details.title;
            song.url = songinfo.video_details.url;
            song.durationRaw = songinfo.video_details.durationRaw;
            song.durationInSeconds = songinfo.video_details.durationInSec;
            song.thumbnail = thumbnail.url;
            song.relatedVideos = songinfo.related_videos[0];
            song.requestedBy = interaction.user;
        } else if (await validate(link) === 'yt_playlist') {
            if (link.includes('&index=')) {
                link = link.slice(0, link.indexOf('&index='));
            }
            if (link.includes('&playnext=1')) {
                link = link.slice(0, link.indexOf('&playnext=1'));
            }
            if (link.includes('&start_radio=1')) {
                link = link.slice(0, link.indexOf('&start_radio=1'));
            }
            if (link.includes('&rv=')) {
                link = link.slice(0, link.indexOf('&rv='));
            }
            const playlistinfo = await playlist_info(link);
            playlist.title = playlistinfo.title;
            playlist.url = playlistinfo.url;
            playlist.thumbnail = playlistinfo.thumbnail?.url || 'https://demofree.sirv.com/nope-not-here.jpg';
            if (!playlist.thumbnail) playlist.thumbnail = 'https://demofree.sirv.com/nope-not-here.jpg';
            playlist.videos = playlistinfo.videos;
            sendasplaylist = true;
            embed = new EmbedBuilder()
                .setTitle('Play')
                .setDescription(`Adding **${playlist.title}** playlist`)
                .setThumbnail(playlist.thumbnail)
                .setFooter({ text:`Requested by ${interaction.user.tag}`, iconURL:interaction.user.avatarURL() });
            interaction.editReply({ embeds: [embed] });
        } else if (await validate(link) === 'so_track') {
            const songinfo = await soundcloud(link);
            if (songinfo.type === 'track') {
                if (songinfo instanceof SoundCloudTrack) {
                    song.title = songinfo.name;
                    song.url = songinfo.url;
                    song.durationRaw = formatTime(songinfo.durationInSec);
                    song.durationInSeconds = songinfo.durationInSec;
                    song.thumbnail = songinfo.thumbnail;
                    song.requestedBy = interaction.user;
                } else {
                    embed = new EmbedBuilder()
                        .setTitle('Play')
                        .setDescription('This is not a SoundCloud track!');
                    return interaction.editReply({ embeds: [embed] });
                }
            } else {
                embed = new EmbedBuilder()
                    .setTitle('Play')
                    .setDescription('This is not a SoundCloud track!');
                return interaction.editReply({ embeds: [embed] });
            }
        } else if (await validate(link) === 'so_playlist') {
            embed = new EmbedBuilder()
                .setTitle('Play')
                .setDescription('SoundCloud playlists are not supported!');
            return interaction.editReply({ embeds: [embed] });
        } else if (await validate(link) === 'sp_track') {
            const songinfo = await spotify(link);
            if (songinfo.type === 'track') {
                if (songinfo instanceof SpotifyTrack) {
                    link = await searchbyname(songinfo.name);
                    if (!link) {
                        embed = new EmbedBuilder()
                            .setTitle('Play')
                            .setDescription('No results found!');
                        return interaction.editReply({ embeds: [embed] });
                    }
                    const songinfo2 = await video_basic_info(link);
                    const thumbnail = songinfo2.video_details.thumbnails[songinfo2.video_details.thumbnails.length - 1];
                    song.title = songinfo2.video_details.title;
                    song.url = songinfo2.video_details.url;
                    song.durationRaw = songinfo2.video_details.durationRaw;
                    song.durationInSeconds = songinfo2.video_details.durationInSec;
                    song.thumbnail = thumbnail.url;
                    song.relatedVideos = songinfo2.related_videos[0];
                    song.requestedBy = interaction.user;
                } else {
                    embed = new EmbedBuilder()
                        .setTitle('Play')
                        .setDescription('This is not a Spotify track!');
                    return interaction.editReply({ embeds: [embed] });
                }
            } else {
                embed = new EmbedBuilder()
                    .setTitle('Play')
                    .setDescription('This is not a Spotify track!');
                return interaction.editReply({ embeds: [embed] });
            }
        } else {
            embed = new EmbedBuilder()
                .setTitle('Play')
                .setDescription('Invalid Input or Link is not supported yet!');
            return interaction.editReply({ embeds: [embed] });
        }
    } catch (err) {
        embed = new EmbedBuilder()
            .setTitle('Play')
            .setDescription('Error while getting the song info!');
        return interaction.editReply({ embeds: [embed] });
    }
    if (!serverdata.songs[0]) {
        if (sendasplaylist) {
            let firsttime = true;
            for (let i = 0; i < playlist.videos.length; i++) {
                const songforadd = Object.assign({}, song);
                let songinfo;
                if (firsttime) {
                    songinfo = await video_basic_info(playlist.videos[i].url);
                    firsttime = false;
                } else {
                    songinfo = video_basic_info(playlist.videos[i].url);
                }
                const thumbnail = songinfo.video_details.thumbnails[songinfo.video_details.thumbnails.length - 1];
                songforadd.title = songinfo.video_details.title;
                songforadd.url = songinfo.video_details.url;
                songforadd.durationRaw = songinfo.video_details.durationRaw;
                songforadd.durationInSeconds = songinfo.video_details.durationInSec;
                songforadd.thumbnail = thumbnail.url;
                songforadd.relatedVideos = songinfo.related_videos[0];
                songforadd.requestedBy = interaction.user;
                await serverdata.songs.push(songforadd);
            }
            embed = new EmbedBuilder()
                .setTitle('Play')
                .setDescription(`**${playlist.title}** playlist has been added!`)
                .setThumbnail(playlist.thumbnail)
                .setFooter({ text:`Requested by ${interaction.user.tag}`, iconURL:interaction.user.avatarURL() });
            interaction.editReply({ embeds: [embed] });
        } else {
            await serverdata.songs.push(song);
            embed = new EmbedBuilder()
                .setTitle('Play')
                .setDescription(`[**${song.title}**](${song.url}) has been added to the queue!\nSong duration: ${song.durationRaw}`)
                .setThumbnail(song.thumbnail)
                .setFooter({ text:`Requested by ${song.requestedBy.tag}`, iconURL:song.requestedBy.avatarURL() });
            interaction.editReply({ embeds: [embed] });
        }
        try {
            const connection = joinVoiceChannel({
                channelId: voicechannel.id,
                guildId: voicechannel.guild.id,
                adapterCreator: voicechannel.guild.voiceAdapterCreator,
            });
            serverdata.connection = connection;
            serverdata.connection.on('stateChange', (old_state, new_state) => {
                if (old_state.status === VoiceConnectionStatus.Ready && new_state.status === VoiceConnectionStatus.Connecting) {
                    serverdata.connection.configureNetworking();
                }
            });
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
        if (sendasplaylist) {
            let firsttime = true;
            for (let i = 0; i < playlist.videos.length; i++) {
                const songforadd = Object.assign({}, song);
                let songinfo;
                if (firsttime) {
                    songinfo = await video_basic_info(playlist.videos[i].url);
                    firsttime = false;
                } else {
                    songinfo = video_basic_info(playlist.videos[i].url);
                }
                const thumbnail = songinfo.video_details.thumbnails[songinfo.video_details.thumbnails.length - 1];
                songforadd.title = songinfo.video_details.title;
                songforadd.url = songinfo.video_details.url;
                songforadd.durationRaw = songinfo.video_details.durationRaw;
                songforadd.durationInSeconds = songinfo.video_details.durationInSec;
                songforadd.thumbnail = thumbnail.url;
                songforadd.relatedVideos = songinfo.related_videos[0];
                songforadd.requestedBy = interaction.user;
                await serverdata.songs.push(songforadd);
            }
        } else {
            serverdata.songs.push(song);
            embed = new EmbedBuilder()
                .setTitle('Play')
                .setDescription(`[**${song.title}**](${song.url}) has been added to the queue!`)
                .setThumbnail(song.thumbnail)
                .setFooter({ text:`Requested by ${song.requestedBy.tag}`, iconURL:song.requestedBy.avatarURL() });
            interaction.editReply({ embeds: [embed] });
        }
    }
}

async function playSong(interaction, song) {
    const serverdata = globaldata.get(interaction.guild.id);
    serverdata.playing = true;
    if (!song) {
        serverdata.timervar = setTimeout(() => {
            serverdata.connection.destroy();
            serverdata.connection = null;
            serverdata.resource = null;
            serverdata.player = null;
            serverdata.playing = false;
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
            const jsonToWrite = JSON.stringify(objToWrite, null, 4);
            fs.writeFile(datapath, jsonToWrite, err => {
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
    const songstream = await stream(song.url, { discordPlayerCompatibility : true, quality: 2 });
    serverdata.resource = createAudioResource(songstream.stream, { inputType: StreamType.Arbitrary, inlineVolume: true });
    serverdata.resource.volume.setVolume(serverdata.volume / 100);
    serverdata.player = createAudioPlayer({
        behaviors: {
            noSubscriber: NoSubscriberBehavior.Pause,
            maxMissedFrames: 100,
        },
    });
    serverdata.player.play(serverdata.resource);
    serverdata.connection.subscribe(serverdata.player);
    serverdata.player.on(AudioPlayerStatus.Idle, async () => {
        if (serverdata.loop) {
            playSong(interaction, serverdata.songs[0]);
        } else if (serverdata.autoplay) {
            if (serverdata.songs[1]) {
                await serverdata.songs.shift();
                playSong(interaction, serverdata.songs[0]);
                return;
            }
            if (!serverdata.songs[0].relatedVideos) {
                await serverdata.songs.shift();
                playSong(interaction, serverdata.songs[0]);
                return;
            }
            if (await validate(serverdata.songs[0].relatedVideos) === 'yt_video') {
                const relatedsong = await video_basic_info(serverdata.songs[0].relatedVideos);
                const relatedsongthumbnail = relatedsong.video_details.thumbnails[relatedsong.video_details.thumbnails.length - 1];
                const resong = {
                    title: relatedsong.video_details.title,
                    url: relatedsong.video_details.url,
                    durationRaw: relatedsong.video_details.durationRaw,
                    durationInSeconds: relatedsong.video_details.durationInSec,
                    thumbnail: relatedsongthumbnail.url,
                    relatedVideos: relatedsong.related_videos[0],
                    requestedBy: interaction.user,
                };
                await serverdata.songs.shift();
                await serverdata.songs.unshift(resong);
                playSong(interaction, serverdata.songs[0]);
            } else {
                await serverdata.songs.shift();
                playSong(interaction, serverdata.songs[0]);
            }
        } else {
            await serverdata.songs.shift();
            playSong(interaction, serverdata.songs[0]);
        }
    });
    serverdata.player.on(AudioPlayerStatus.Playing, () => {
        clearTimeout(serverdata.timervar);
        serverdata.playing = true;
    });
    serverdata.player.on(AudioPlayerStatus.AutoPaused, async () => {
        serverdata.timervar = setTimeout(async () => {
            if (serverdata.connection.status != 'disconnected') await serverdata.connection.destroy();
            serverdata.connection = null;
            serverdata.resource = null;
            serverdata.player = null;
            serverdata.playing = false;
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
            const jsonToWrite = JSON.stringify(objToWrite, null, 4);
            fs.writeFile(datapath, jsonToWrite, err => {
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
        .setDescription(`Now playing [**${song.title}**](${song.url})\nSong duration: ${song.durationRaw}`)
        .setThumbnail(song.thumbnail)
        .setFooter({ text:`Requested by ${song.requestedBy.tag}`, iconURL:song.requestedBy.avatarURL() });
    await interaction.channel.send({ embeds: [embed] });
}

async function mysearch(interaction) {
    const songname = await interaction.options.getString('query');
    const song = await search(songname, { limit: 1 });
    if (!song[0].url) return false;
    const songurl = song[0].url;
    return songurl;
}

async function searchbyname(input) {
    const song = await search(input, { limit: 1 });
    if (!song[0].url) return false;
    const songurl = song[0].url;
    return songurl;
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secondsLeft = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secondsLeft.toString().padStart(2, '0')}`;
}
