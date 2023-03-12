const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const lyricsFinder = require('lyrics-finder');

const { globaldata } = require('../data/global');

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
    const voicechannel = interaction.member.voice.channel;
    let embed = new EmbedBuilder()
        .setTitle('Lyrics')
        .setDescription('You need to be in a voice channel to use this command!');
    if (!voicechannel) return interaction.editReply({ embeds: [embed], ephemeral: true });
    const serverdata = globaldata.get(interaction.guild.id);
    embed = new EmbedBuilder()
        .setTitle('Lyrics')
        .setDescription('This server is not enabled for music commands!');
    if (!serverdata) return interaction.editReply({ embeds: [embed], ephemeral: true });
    const enabled = serverdata.textchannel.find((channel) => channel.id === interaction.channel.id);
    embed = new EmbedBuilder()
        .setTitle('Lyrics')
        .setDescription('This channel is not enabled for music commands!');
    if (!enabled) return interaction.editReply({ embeds: [embed], ephemeral: true });
    const songname = globaldata.get(interaction.guild.id).songs[0].title;
    embed = new EmbedBuilder()
        .setTitle('Lyrics')
        .setDescription('There is no song in queue right now');
    if (!songname) return interaction.editReply({ embeds: [embed], ephemeral: true });
    const artistname = interaction.options.getString('artist') ?? '';
    const songlyrics = await lyricsFinders(songname, artistname);
    embed = new EmbedBuilder()
        .setTitle('Lyrics')
        .setDescription('I could not find the lyrics for that song!');
    if (!songlyrics) return interaction.editReply({ embeds: [embed], ephemeral: true });
    const lyricsembed = new EmbedBuilder()
        .setTitle(`Lyrics for ${songname}`)
        .setDescription(`\`\`\`${songlyrics}\`\`\``);
    await interaction.editReply({ embeds: [lyricsembed] });
}

async function lyricsFinders(artist, title) {
    const lyric = await lyricsFinder(artist, title) || false;
    return lyric;
}