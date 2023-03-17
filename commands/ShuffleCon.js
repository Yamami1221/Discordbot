const { ContextMenuCommandBuilder, ApplicationCommandType, EmbedBuilder } = require('discord.js');

const { globaldata } = require('../data/global');

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('Shuffle')
        .setType(ApplicationCommandType.Message),
    async execute(interaction) {
        shuffle(interaction);
    },
};

async function shuffle(interaction) {
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
        .setTitle('Shuffle')
        .setDescription('you need to be in a voice channel to use this command!');
    if (!connection) return interaction.editReply({ embeds: [embed], ephemeral: true });
    const serverdata = globaldata.get(interaction.guild.id);
    embed = new EmbedBuilder()
        .setTitle('Shuffle')
        .setDescription('This server is not enabled for music commands!');
    if (!serverdata) return interaction.editReply({ embeds: [embed], ephemeral: true });
    const enabled = serverdata.textchannel.find((channel) => channel.id === interaction.channel.id);
    embed = new EmbedBuilder()
        .setTitle('Shuffle')
        .setDescription('This channel is not enabled for music commands!');
    if (!enabled) return interaction.editReply({ embeds: [embed], ephemeral: true });
    embed = new EmbedBuilder()
        .setTitle('Shuffle')
        .setDescription('There are not enough songs in the queue to shuffle!');
    if (serverdata.songs.length < 2) return interaction.editReply({ embeds: [embed], ephemeral: true });
    serverdata.songs = shuffleArray(serverdata.songs);
    embed = new EmbedBuilder()
        .setTitle('Shuffle')
        .setDescription('Shuffled the queue!');
    await interaction.editReply({ embeds: [embed] });
}

function shuffleArray(array) {
    const shuffled = array
        .slice(1)
        .sort(() => Math.random() - 0.5);
    const result = [array[0], ...shuffled];
    return result;
}