const { ContextMenuCommandBuilder, ApplicationCommandType, EmbedBuilder } = require('discord.js');

const { globaldata } = require('../data/global');

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('Skip')
        .setType(ApplicationCommandType.Message),
    async execute(interaction) {
        skip(interaction);
    },
};

async function skip(interaction) {
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
        .setTitle('Skip')
        .setDescription('you need to be in a voice channel to use this command!');
    if (!connection) return interaction.editReply({ embeds: [embed], ephemeral: true });
    const serverdata = globaldata.get(interaction.guild.id);
    embed = new EmbedBuilder()
        .setTitle('Skip')
        .setDescription('This server is not enabled for music commands!');
    if (!serverdata) return interaction.editReply({ embeds: [embed], ephemeral: true });
    const enabled = serverdata.textchannel.find((channel) => channel.id === interaction.channel.id);
    embed = new EmbedBuilder()
        .setTitle('Skip')
        .setDescription('This channel is not enabled for music commands!');
    if (!enabled) return interaction.editReply({ embeds: [embed], ephemeral: true });
    embed = new EmbedBuilder()
        .setTitle('Skip')
        .setDescription('There are no songs in the queue!');
    if (!serverdata.songs[0]) return interaction.editReply({ embeds: [embed], ephemeral: true });
    const currensong = serverdata.songs[0];
    embed = new EmbedBuilder()
        .setTitle('Skip')
        .setDescription(`Skipped the song **${currensong.title}**!`);
    serverdata.player.stop();
    await interaction.editReply({ embeds: [embed] });
}