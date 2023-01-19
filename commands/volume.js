const { SlashCommandBuilder } = require('discord.js');

const { globalqueue, globalresource } = require('../global.js');

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
    if (!voicechannel) return interaction.editReply({ content: 'You are not in a voice channel!', ephemeral: true });
    const serverqueue = globalqueue.get(interaction.guild.id);
    if (!serverqueue) return interaction.editReply({ content: 'This server is not enabled for music commands', ephemeral: true });
    let enabled = false;
    for (let i = 0; i < serverqueue.songs.length; i++) {
        if (serverqueue.textchannel[i].id === interaction.channel.id) {
            enabled = true;
        }
    }
    if (enabled === false) return interaction.editReply({ content: 'This channel is not enabled for music commands', ephemeral: true });
    const song = serverqueue.songs[0];
    if (!song) return interaction.editReply({ content: 'There is no song that I could change the volume of!', ephemeral: true });
    const useresource = globalresource.get(interaction.guild.id);
    const volumes = interaction.options.getInteger('volume');
    if (volumes > 200 || volumes < 0) return interaction.editReply({ content: 'The volume must be between 0 and 200!', ephemeral: true });
    serverqueue.volume = volumes;
    await useresource.volume.setVolume(serverqueue.volume / 100);
    await interaction.editReply({ content: `Set the volume to ${volumes}!` });
}