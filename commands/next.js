const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { yt_validate, video_basic_info } = require('play-dl');
const ytdl = require('ytdl-core');
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
    let enabled = false;
    for (let i = 0; i < serverdata.textchannel.length; i++) {
        if (serverdata.textchannel[i].id === interaction.channel.id) {
            enabled = true;
            break;
        }
    }
    embed = new EmbedBuilder()
        .setTitle('Next')
        .setDescription('This channel is not enabled for music commands');
    if (!enabled) return interaction.editReply({ embeds: [embed], ephemeral: true });
    embed = new EmbedBuilder()
        .setTitle('Next')
        .setDescription('There is no song in queue right now');
    if (!serverdata.songs[0]) return interaction.editReply({ embeds: [embed], ephemeral: true });
    let link = interaction.options.getString('query');
    if (!await isValidYoutubeUrl(link) && !await isValidURL(link)) {
        link = await search(interaction);
        if (!link) {
            embed = new EmbedBuilder()
                .setTitle('Next')
                .setDescription('No results found!');
            return interaction.editReply({ embeds: [embed], ephemeral: true });
        }
    }
    const songinfo1 = await video_basic_info(link);
    const songinfo2 = await ytdl.getBasicInfo(link);
    const song = {
        title: songinfo1.video_details.title,
        url: songinfo2.videoDetails.video_url,
    };
    serverdata.songs.splice(1, 0, song);
    embed = new EmbedBuilder()
        .setTitle('Next')
        .setDescription(`Added ${song.title} to the queue in next position`);
    interaction.editReply({ embeds: [embed] });
}

async function isValidYoutubeUrl(url) {
    const regex = new RegExp(
        // eslint-disable-next-line no-useless-escape
        /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/,
    );
    return regex.test(url);
}

async function isValidURL(url) {
    if (yt_validate(url) === 'video') {
        return true;
    } else {
        return false;
    }
}

async function search(interaction) {
    const songname = interaction.options.getString('query');
    const song = await ytsr(songname, { limit: 1 });
    if (!song.items[0]) return false;
    const songurl = song.items[0].url;
    return songurl;
}