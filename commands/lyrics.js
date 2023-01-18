const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const lyricsFinder = require('lyrics-finder');
const { globalqueue } = require('../global.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lyrics')
        .setDescription('Shows the lyrics of the current song')
        .addStringOption(option =>
            option
                .setName('artist')
                .setDescription('artist of song'))
        .setDMPermission(false),
    async execute(interaction) {
        lyrics(interaction);
    },
};

async function lyrics(interaction) {
    await interaction.deferReply();
    const songname = globalqueue.get(interaction.guild.id).songs[0].title;
    if (!songname) return interaction.editReply({ content: 'There is no song in queue right now', ephemeral: true });
    const artistname = interaction.options.getString('artist') ?? '';
    const songlyrics = await lyricsFinders(songname, artistname);
    if (!songlyrics) return interaction.editReply({ content: 'I could not find the lyrics for that song!', ephemeral: true });
    const lyricsembed = new EmbedBuilder()
        .setTitle(`Lyrics for ${songname}`)
        .setDescription(songlyrics)
        .setColor('#ff8400');
    await interaction.editReply({ embeds: [lyricsembed] });
}

async function lyricsFinders(artist, title) {
    const lyric = await lyricsFinder(artist, title) || false;
    return lyric;
}