const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { video_basic_info, validate, playlist_info } = require('play-dl');
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
    const serverdata = globaldata.get(interaction.guild.id);
    const voicechannel = interaction.member.voice.channel;
    let embed = new EmbedBuilder()
        .setTitle('Next')
        .setDescription('You need to be in a voice channel to use this command!');
    if (!voicechannel) return interaction.editReply({ embeds: [embed], ephemeral: true });
    embed = new EmbedBuilder()
        .setTitle('Next')
        .setDescription('This server is not enabled for music commands');
    if (!serverdata) return interaction.editReply({ embeds: [embed], ephemeral: true });
    const enabled = serverdata.textchannel.find((channel) => channel.id === interaction.channel.id);
    embed = new EmbedBuilder()
        .setTitle('Next')
        .setDescription('This channel is not enabled for music commands');
    if (!enabled) return interaction.editReply({ embeds: [embed], ephemeral: true });
    embed = new EmbedBuilder()
        .setTitle('Next')
        .setDescription('There is no song in queue right now');
    if (!serverdata.songs[0]) return interaction.editReply({ embeds: [embed], ephemeral: true });
    let link = interaction.options.getString('query');
    if (await validate(link) === 'search') {
        link = await search(interaction);
        if (!link) {
            embed = new EmbedBuilder()
                .setTitle('Play')
                .setDescription('No results found!');
            return interaction.editReply({ embeds: [embed], ephemeral: true });
        }
    }
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
        song.relatedVideos = songinfo.video_details.related_videos;
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
            song.relatedVideos = songinfo.video_details.related_videos;
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
    embed = new EmbedBuilder()
        .setTitle('Next')
        .setDescription('You Can\'t add playlist to queue');
    if (sendasplaylist) return interaction.editReply({ embeds: [embed] });
    serverdata.songs.splice(1, 0, song);
    embed = new EmbedBuilder()
        .setTitle('Next')
        .setDescription(`Added ${song.title} to the queue in next position`);
    interaction.editReply({ embeds: [embed] });
}

async function search(interaction) {
    const songname = interaction.options.getString('query');
    const song = await ytsr(songname, { limit: 1 });
    if (!song.items[0]) return false;
    const songurl = song.items[0].url;
    return songurl;
}