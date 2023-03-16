const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const { globaldata } = require('../data/global');

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
        .setTitle('Resume')
        .setDescription('You need to be in a voice channel to use this command!');
    if (!connection) return interaction.editReply({ embeds: [embed], ephemeral: true });
    const serverdata = globaldata.get(interaction.guild.id);
    embed = new EmbedBuilder()
        .setTitle('Resume')
        .setDescription('This server is not enabled for music commands!');
    if (!serverdata) return interaction.editReply({ embeds: [embed], ephemeral: true });
    const enabled = serverdata.textchannel.find((channel) => channel.id === interaction.channel.id);
    embed = new EmbedBuilder()
        .setTitle('Resume')
        .setDescription('This channel is not enabled for music commands!');
    if (!enabled) return interaction.editReply({ embeds: [embed], ephemeral: true });
    embed = new EmbedBuilder()
        .setTitle('Resume')
        .setDescription('There is no song in queue right now');
    if (!serverdata.songs[0]) return interaction.editReply({ embeds: [embed], ephemeral: true });
    embed = new EmbedBuilder()
        .setTitle('Resume')
        .setDescription('The music is already playing!');
    if (serverdata.player.state.status === 'playing') return interaction.editReply({ embeds: [embed], ephemeral: true });
    serverdata.player.unpause();
    embed = new EmbedBuilder()
        .setTitle('Resume')
        .setDescription('Resumed the current song!');
    interaction.editReply({ embeds: [embed] });
}