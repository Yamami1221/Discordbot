const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const { globalqueue } = require('../global.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('Removes a song from the queue')
        .addIntegerOption(option =>
            option.setName('position')
                .setDescription('The position of the song in the queue')
                .setRequired(true)),
    async execute(interaction) {
        remove(interaction);
    },
};

async function remove(interaction) {
    await interaction.deferReply();
    const voicechannel = interaction.member.voice.channel;
    let embed = new EmbedBuilder()
        .setTitle('Remove')
        .setDescription('You need to be in a voice channel to use this command!');
    if (!voicechannel) return interaction.editReply({ embeds: [embed], ephemeral: true });
    const serverqueue = globalqueue.get(interaction.guild.id);
    embed = new EmbedBuilder()
        .setTitle('Remove')
        .setDescription('This server is not enabled music commands!');
    if (!serverqueue) return interaction.editReply({ embeds: [embed], ephemeral: true });
    let enabled = false;
    for (let i = 0; i < serverqueue.textchannels.length; i++) {
        if (serverqueue.textchannels[i] == interaction.channel.id) {
            enabled = true;
            break;
        }
    }
    embed = new EmbedBuilder()
        .setTitle('Remove')
        .setDescription('This channel is not enabled music commands!');
    if (!enabled) return interaction.editReply({ embeds: [embed], ephemeral: true });
    embed = new EmbedBuilder()
        .setTitle('Remove')
        .setDescription('There is nothing in the queue!');
    if (!serverqueue.songs[0]) return interaction.editReply({ embeds: [embed], ephemeral: true });
    const index = interaction.options.getInteger('position');
    embed = new EmbedBuilder()
        .setTitle('Remove')
        .setDescription('You need to provide a valid position!');
    if (index > serverqueue.songs.length) return interaction.editReply({ embeds: [embed], ephemeral: true });
    embed = new EmbedBuilder()
        .setTitle('Remove')
        .setDescription(`Removed the song name: ${serverqueue.songs[index - 1].title}!`);
    await interaction.editReply({ embeds: [embed] });
    serverqueue.songs.splice(index - 1, 1);
}