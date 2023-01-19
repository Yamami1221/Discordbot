const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const { globalqueue } = require('../global.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('Shows the current song'),
    async execute(interaction) {
        nowplaying(interaction);
    },
};

async function nowplaying(interaction) {
    await interaction.deferReply();
    const serverqueue = globalqueue.get(interaction.guild.id);
    let embed = new EmbedBuilder()
        .setTitle('Now Playing')
        .setDescription('This server is not enabled for music commands!');
    if (!serverqueue) return interaction.editReply({ embeds: [embed], ephemeral: true });
    const title = serverqueue?.songs[0]?.title;
    const connection = interaction.member.voice.channel;
    embed = new EmbedBuilder()
        .setTitle('Now Playing')
        .setDescription('You need to be in a voice channel to use this command!');
    if (!connection) return interaction.editReply({ embeds: [embed], ephemeral: true });
    embed = new EmbedBuilder()
        .setTitle('Now Playing')
        .setDescription('There is no song in queue right now');
    if (!title) return interaction.editReply({ embeds: [embed], ephemeral: true });
    const songembed = new EmbedBuilder()
        .setTitle('Now Playing')
        .setDescription(`**${serverqueue.songs[0].title}**`);
    await interaction.editReply({ embeds: [songembed] });
}