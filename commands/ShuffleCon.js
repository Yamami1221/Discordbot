const { ContextMenuCommandBuilder, ApplicationCommandType, EmbedBuilder } = require('discord.js');

const { globalqueue } = require('../global.js');

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('shuffle')
        .setType(ApplicationCommandType.Message),
    async execute(interaction) {
        shuffle(interaction);
    },
};

async function shuffle(interaction) {
    await interaction.deferReply();
    const connection = interaction.member.voice.channel;
    let embed = new EmbedBuilder()
        .setTitle('Shuffle')
        .setDescription('you need to be in a voice channel to use this command!');
    if (!connection) return interaction.editReply({ embeds: [embed], ephemeral: true });
    const serverqueue = globalqueue.get(interaction.guild.id);
    embed = new EmbedBuilder()
        .setTitle('Shuffle')
        .setDescription('This server is not enabled for music commands!');
    if (!serverqueue) return interaction.editReply({ embeds: [embed], ephemeral: true });
    let enabled = false;
    for (let i = 0; i < serverqueue.textchannel.length; i++) {
        if (serverqueue.textchannel[i].id == interaction.channel.id) enabled = true;
    }
    embed = new EmbedBuilder()
        .setTitle('Shuffle')
        .setDescription('This channel is not enabled for music commands!');
    if (!enabled) return interaction.editReply({ embeds: [embed], ephemeral: true });
    embed = new EmbedBuilder()
        .setTitle('Shuffle')
        .setDescription('There are not enough songs in the queue to shuffle!');
    if (serverqueue.songs.length < 2) return interaction.editReply({ embeds: [embed], ephemeral: true });
    serverqueue.songs = shuffleArray(serverqueue.songs);
    embed = new EmbedBuilder()
        .setTitle('Shuffle')
        .setDescription('Shuffled the queue!');
    await interaction.editReply({ embeds: [embed] });
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}