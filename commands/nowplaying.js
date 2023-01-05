const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const { globalqueue } = require('../global.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('Shows the current song'),
    async execute(interaction) {
        nowplaying(interaction);
    },
};

async function nowplaying(interaction) {
    await interaction.deferReply();
    const serverqueue = globalqueue.get(interaction.guild.id);
    const title = serverqueue.songs[0].title;
    const connection = interaction.member.voice.channel;
    if (!connection) return interaction.editReply({ content: 'You need to be in a voice channel to use this command!', ephemeral: true });
    if (!title) return interaction.editReply({ content: 'There is no song that I could show!', ephemeral: true });
    const songembed = new EmbedBuilder()
        .setTitle('Now Playing')
        .setDescription(`**${serverqueue.songs[0].title}**`)
        .setColor('#ff8400');
    await interaction.editReply({ embeds: [songembed] });
}