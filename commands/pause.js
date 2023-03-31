const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const { globaldata } = require('../data/global');

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
    const connection = interaction.member.voice.channel;
    let embed = new EmbedBuilder()
        .setTitle('Pause')
        .setDescription('You need to be in a voice channel to use this command!');
    if (!connection) return interaction.editReply({ embeds: [embed], ephemeral: true });
    const serverdata = globaldata.get(interaction.guild.id);
    embed = new EmbedBuilder()
        .setTitle('Pause')
        .setDescription('This server is not enabled for music commands!');
    if (!serverdata) return interaction.editReply({ embeds: [embed], ephemeral: true });
    const enabled = serverdata.textchannel.find((channel) => channel.id === interaction.channel.id);
    embed = new EmbedBuilder()
        .setTitle('Pause')
        .setDescription('This channel is not enabled for music commands!');
    if (!enabled) return interaction.editReply({ embeds: [embed], ephemeral: true });
    embed = new EmbedBuilder()
        .setTitle('Pause')
        .setDescription('There is no song in queue right now');
    if (!serverdata.songs[0]) return interaction.editReply({ embeds: [embed], ephemeral: true });
    embed = new EmbedBuilder()
        .setTitle('Pause')
        .setDescription('There is no music playing right now');
    if (!serverdata.player) return interaction.editReply({ embeds: [embed], ephemeral: true });
    embed = new EmbedBuilder()
        .setTitle('Pause')
        .setDescription('The music is already paused!');
    if (serverdata.player.state.status === 'paused') return interaction.editReply({ embeds: [embed], ephemeral: true });
    serverdata.player.pause();
    embed = new EmbedBuilder()
        .setTitle('Pause')
        .setDescription('Paused the music!');
    await interaction.editReply({ embeds: [embed] });
}