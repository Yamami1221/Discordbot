const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const { globalqueue } = require('../global.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stops the music and clears the queue'),
    async execute(interaction) {
        stop(interaction);
    },
};

async function stop(interaction) {
    await interaction.deferReply();
    const connection = interaction.member.voice.channel;
    let embed = new EmbedBuilder()
        .setTitle('Stop')
        .setDescription('You need to be in a voice channel to use this command!');
    if (!connection) return interaction.editReply({ embeds: [embed], ephemeral: true });
    const serverqueue = globalqueue.get(interaction.guild.id);
    embed = new EmbedBuilder()
        .setTitle('Stop')
        .setDescription('This server is not enabled for music commands!');
    if (!serverqueue) return interaction.editReply({ embeds: [embed], ephemeral: true });
    let enabled = false;
    for (let i = 0; i < serverqueue.channel.length; i++) {
        if (serverqueue.channel[i].id == interaction.channel.id) enabled = true;
    }
    embed = new EmbedBuilder()
        .setTitle('Stop')
        .setDescription('This channel is not enabled for music commands!');
    if (!enabled) return interaction.editReply({ embeds: [embed], ephemeral: true });
    serverqueue.songs = [];
    serverqueue.player.stop();
    serverqueue.connection.destroy();
    embed = new EmbedBuilder()
        .setTitle('Stop')
        .setDescription('Stopped the music!');
    await interaction.editReply({ embeds: [embed] });
}