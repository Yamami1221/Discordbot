const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { video_basic_info, validate, playlist_info, getFreeClientID, setToken, is_expired, refreshToken, soundcloud, spotify, SoundCloudTrack, SpotifyTrack } = require('play-dl');
const ytsr = require('ytsr');
const { globaldata } = require('../data/global');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('next')
        .setDescription('Add a song to the queue in next position')
        .setDMPermission(false)
        .addStringOption(option =>
            option.setName('query')
                .setDescription('The link or name of the song to play')
                .setRequired(true)),
    async execute(interaction) {
        next(interaction);
    },
};

async function next(interaction) {
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
    let embed = new EmbedBuilder()
        .setTitle('Next')
        .setDescription('There is no song in queue right now');
    if (!serverdata.songs[0]) return interaction.editReply({ embeds: [embed], ephemeral: true });
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
            embed = new EmbedBuilder()
                .setTitle('Next')
                .setDescription('No results found!');
            return interaction.editReply({ embeds: [embed], ephemeral: true });
        }
    }
    const voicechannel = interaction.member.voice.channel;
    embed = new EmbedBuilder()
        .setTitle('Next')
        .setDescription('You need to be in a voice channel to use this command!');
    if (!voicechannel) return interaction.editReply({ embeds: [embed] });
    const permissions = voicechannel.permissionsFor(interaction.client.user);
    if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
        const permissionsembed = new EmbedBuilder()
            .setTitle('Next')
            .setDescription('I need the permissions to join and speak in your voice channel!');
        return interaction.editReply({ embeds: [permissionsembed] });
    }
    const serverdata = globaldata.get(interaction.guild.id);
    embed = new EmbedBuilder()
        .setTitle('Next')
        .setDescription('This server is not enabled for music commands!');
    if (!serverdata) return interaction.editReply({ embeds: [embed] });
    const enabled = serverdata.textchannel.find((channel) => channel.id === interaction.channel.id);
    embed = new EmbedBuilder()
        .setTitle('Next')
        .setDescription('this channel is not enabled for music commands!');
    if (!enabled) return interaction.editReply({ embeds: [embed] });
    embed = new EmbedBuilder()
        .setTitle('Next')
        .setDescription('There is no song in queue right now');
    if (!serverdata.songs[0]) return interaction.editReply({ embeds: [embed] });
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
    if (sendasplaylist) {
        for (let i = 0; i < playlist.videos.length; i++) {
            const song2 = {};
            const songinfo = video_basic_info(playlist.videos[i].url);
            const thumbnail = songinfo.video_details.thumbnails[songinfo.video_details.thumbnails.length - 1];
            song2.title = songinfo.video_details.title;
            song2.url = songinfo.video_details.url;
            song2.durationRaw = songinfo.video_details.durationRaw;
            song2.durationInSeconds = songinfo.video_details.durationInSec;
            song2.thumbnail = thumbnail.url;
            song2.relatedVideos = songinfo.related_videos[0];
            song2.requestedBy = interaction.user;
            serverdata.songs.splice(1, 0, song2);
        }
        embed = new EmbedBuilder()
            .setTitle('Play')
            .setDescription(`Added [**${playlist.title}**](${playlist.url}) playlist to the queue\nSongs: ${playlist.videos.length}`)
            .setThumbnail(playlist.thumbnail)
            .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.avatarURL() });
        return interaction.editReply({ embeds: [embed] });
    }
    serverdata.songs.splice(1, 0, song);
    embed = new EmbedBuilder()
        .setTitle('Next')
        .setDescription(`Added [**${song.title}**](${song.url}) to the queue in next position\nDuration: ${song.durationRaw}`)
        .setThumbnail(song.thumbnail)
        .setFooter({ text: `Requested by ${song.requestedBy.tag}`, iconURL: song.requestedBy.avatarURL() });
    interaction.editReply({ embeds: [embed] });
}

async function search(interaction) {
    const songname = interaction.options.getString('query');
    const song = await ytsr(songname, { limit: 1 });
    if (!song.items[0]) return false;
    const songurl = song.items[0].url;
    return songurl;
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
