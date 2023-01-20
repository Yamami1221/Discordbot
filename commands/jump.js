const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const { globalqueue } = require('../global.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('jump')
        .setDescription('Jumps to a specific song in the queue')
        .addIntegerOption(option =>
            option.setName('position')
                .setDescription('The position of the song in the queue')
                .setMinValue(2)
                .setRequired(true)),
    async execute(interaction) {
        jump(interaction);
    },
};

async function jump(interaction) {
    await interaction.deferReply();
    const serverqueue = globalqueue.get(interaction.guild.id);
    const voicechannel = interaction.member.voice.channel;
    let embed = new EmbedBuilder()
        .setTitle('Jump')
        .setDescription('You need to be in a voice channel to use this command!');
    if (!voicechannel) return interaction.editReply({ embeds: [embed], ephemeral: true });
    embed = new EmbedBuilder()
        .setTitle('Jump')
        .setDescription('This server is not enabled for music commands');
    if (!serverqueue) return interaction.editReply({ embeds: [embed], ephemeral: true });
    let enabled = false;
    for (let i = 0; i < serverqueue.textchannel.length; i++) {
        if (serverqueue.textchannel[i].id === interaction.channel.id) {
            enabled = true;
            break;
        }
    }
    embed = new EmbedBuilder()
        .setTitle('Jump')
        .setDescription('This channel is not enabled for music commands');
    if (!enabled) return interaction.editReply({ embeds: [embed], ephemeral: true });
    embed = new EmbedBuilder()
        .setTitle('Jump')
        .setDescription('There is no song in queue right now');
    if (!serverqueue.songs[0]) return interaction.editReply({ embeds: [embed], ephemeral: true });
    const jumpto = interaction.options.getInteger('position');
    if (jumpto > serverqueue.songs.length) return interaction.editReply({ content: 'There is no song at that position!', ephemeral: true });
    serverqueue.songs = serverqueue.songs.slice(jumpto - 1);
    const song = serverqueue.songs[0];
    serverqueue.player.stop();
    serverqueue.loop = false;
    embed = new EmbedBuilder()
        .setTitle('Jump')
        .setDescription(`Jumped to **${song.title}**`);
    await interaction.editReply({ embeds: [embed] });
}