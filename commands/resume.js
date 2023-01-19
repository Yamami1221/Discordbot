const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const { globalqueue } = require('../global.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Resumes the current song'),
    async execute(interaction) {
        resume(interaction);
    },
};

async function resume(interaction) {
    await interaction.deferReply();
    const connection = interaction.member.voice.channel;
    embed = new EmbedBuilder()
        .setTitle('Resume')
        .setDescription('You need to be in a voice channel to use this command!');
    if (!connection) return interaction.editReply({ embeds: [embed], ephemeral: true });
    const serverqueue = globalqueue.get(interaction.guild.id);
    let embed = new EmbedBuilder()
        .setTitle('Resume')
        .setDescription('This server is not enabled for music commands!');
    if (!serverqueue) return interaction.editReply({ embeds: [embed], ephemeral: true });
    let enabled = false;
    for (let i = 0; i < serverqueue.textchannel.length; i++) {
        if (serverqueue.textchannel[i].id == interaction.channel.id) enabled = true;
    }
    embed = new EmbedBuilder()
        .setTitle('Resume')
        .setDescription('This channel is not enabled for music commands!');
    if (!enabled) return interaction.editReply({ embeds: [embed], ephemeral: true });
    embed = new EmbedBuilder()
        .setTitle('Resume')
        .setDescription('There is no song in queue right now');
    if (!serverqueue.songs[0]) return interaction.editReply({ embeds: [embed], ephemeral: true });
    embed = new EmbedBuilder()
        .setTitle('Resume')
        .setDescription('The music is already playing!');
    if (serverqueue.playing == true) return interaction.editReply({ embeds: [embed], ephemeral: true });
    serverqueue.resource.unpause();
    serverqueue.playing = true;
    embed = new EmbedBuilder()
        .setTitle('Resume')
        .setDescription('Resumed the music!');
    await interaction.editReply({ embeds: [embed] });
}