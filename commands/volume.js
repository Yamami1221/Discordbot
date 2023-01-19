const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const { globalqueue } = require('../global.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('Sets the volume of the player')
        .addIntegerOption(option =>
            option.setName('volume')
                .setDescription('The volume to set the player to')
                .setMinValue(0)
                .setMaxValue(200)
                .setRequired(true)),
    async execute(interaction) {
        volume(interaction);
    },
};

async function volume(interaction) {
    await interaction.deferReply();
    const voicechannel = interaction.member.voice.channel;
    let embed = new EmbedBuilder()
        .setTitle('Volume')
        .setDescription('You need to be in a voice channel to use this command!');
    if (!voicechannel) return interaction.editReply({ embeds: [embed], ephemeral: true });
    const serverqueue = globalqueue.get(interaction.guild.id);
    embed = new EmbedBuilder()
        .setTitle('Volume')
        .setDescription('This server is not enabled for music commands!');
    if (!serverqueue) return interaction.editReply({ embeds: [embed], ephemeral: true });
    let enabled = false;
    for (let i = 0; i < serverqueue.songs.length; i++) {
        if (serverqueue.textchannel[i].id === interaction.channel.id) enabled = true;
    }
    embed = new EmbedBuilder()
        .setTitle('Volume')
        .setDescription('This channel is not enabled for music commands!');
    if (!enabled) return interaction.editReply({ embeds: [embed], ephemeral: true });
    const volumes = interaction.options.getInteger('volume');
    embed = new EmbedBuilder()
        .setTitle('Volume')
        .setDescription('The volume must be between 0 and 200!');
    if (volumes > 200 || volumes < 0) return interaction.editReply({ embeds: [embed], ephemeral: true });
    serverqueue.volume = volumes;
    await serverqueue.resource.volume.setVolume(serverqueue.volume / 100);
    embed = new EmbedBuilder()
        .setTitle('Volume')
        .setDescription(`Set the volume to ${volumes}!`);
    await interaction.editReply({ embeds: [embed] });
}