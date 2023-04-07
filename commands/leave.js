const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const { globaldata } = require('../data/global');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Stops the music and clears the queue'),
    async execute(interaction) {
        leave(interaction);
    },
};

async function leave(interaction) {
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
        .setTitle('Leave')
        .setDescription('You need to be in a voice channel to use this command!');
    if (!connection) return interaction.editReply({ embeds: [embed], ephemeral: true });
    const serverdata = globaldata.get(interaction.guild.id);
    embed = new EmbedBuilder()
        .setTitle('Leave')
        .setDescription('This server is not enabled for music commands!');
    if (!serverdata) return interaction.editReply({ embeds: [embed], ephemeral: true });
    const enabled = serverdata.textchannel.find((channel) => channel.id === interaction.channel.id);
    embed = new EmbedBuilder()
        .setTitle('Leave')
        .setDescription('This channel is not enabled for music commands!');
    if (!enabled) return interaction.editReply({ embeds: [embed], ephemeral: true });
    embed = new EmbedBuilder()
        .setTitle('Leave')
        .setDescription('The bot is not in a voice channel!');
    if (!serverdata.connection) return interaction.editReply({ embeds: [embed], ephemeral: true });
    serverdata.songs = [];
    if (serverdata.player) {
        await serverdata.player.stop();
        serverdata.player = null;
    }
    if (serverdata.connection) {
        await serverdata.connection.destroy();
        serverdata.playing = false;
        clearTimeout(serverdata.timervar);
    }
    clearTimeout(serverdata.timervar);
    await interaction.deleteReply();
}