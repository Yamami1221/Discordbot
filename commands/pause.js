const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const { globalqueue } = require('../global.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pauses the current song'),
    async execute(interaction) {
        pauses(interaction);
    },
};

async function pauses(interaction) {
    await interaction.deferReply();
    serverqueue.playing = false;
    const serverqueue = globalqueue.get(interaction.guild.id);
    let embed = new EmbedBuilder()
        .setTitle('Pause')
        .setDescription('This server is not enabled for music commands!');
    if (!serverqueue) return interaction.editReply({ embeds: [embed], ephemeral: true });
    const connection = interaction.member.voice.channel;
    embed = new EmbedBuilder()
        .setTitle('Pause')
        .setDescription('You need to be in a voice channel to use this command!');
    if (!connection) return interaction.editReply({ embeds: [embed], ephemeral: true });
    embed = new EmbedBuilder()
        .setTitle('Pause')
        .setDescription('There is no song in queue right now');
    if (!serverqueue.songs[0]) return interaction.editReply({ embeds: [embed], ephemeral: true });
    embed = new EmbedBuilder()
        .setTitle('Pause')
        .setDescription('The music is already paused!');
    if (serverqueue.playing == false) return interaction.editReply({ embeds: [embed], ephemeral: true });
    serverqueue.resource.pause();
    embed = new EmbedBuilder()
        .setTitle('Pause')
        .setDescription('Paused the music!');
    await interaction.editReply({ embeds: [embed] });
}