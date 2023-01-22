const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const { globalqueue } = require('../global.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('np')
        .setDescription('Shows the current song'),
    async execute(interaction) {
        nowplaying(interaction);
    },
};

async function nowplaying(interaction) {
    await interaction.deferReply();
    const serverQueue = globalqueue.get(interaction.guildId);
    if (serverQueue.veriChannel) {
        if (interaction.channel.id === serverQueue.veriChannel.id) {
            const embed = new EmbedBuilder()
                .setTitle('Verification')
                .setDescription('You cannot use this command in the verification channel');
            await interaction.editReply({ embeds: [embed], ephemeral: true });
            return;
        }
    }
    const connection = interaction.member.voice.channel;
    let embed = new EmbedBuilder()
        .setTitle('Now Playing')
        .setDescription('You need to be in a voice channel to use this command!');
    if (!connection) return interaction.editReply({ embeds: [embed], ephemeral: true });
    const serverqueue = globalqueue.get(interaction.guild.id);
    embed = new EmbedBuilder()
        .setTitle('Now Playing')
        .setDescription('This server is not enabled for music commands!');
    if (!serverqueue) return interaction.editReply({ embeds: [embed], ephemeral: true });
    let enabled = false;
    for (let i = 0; i < serverqueue.textchannel.length; i++) {
        if (serverqueue.textchannel[i].id == interaction.channel.id) enabled = true;
    }
    embed = new EmbedBuilder()
        .setTitle('Now Playing')
        .setDescription('This channel is not enabled for music commands!');
    if (!enabled) return interaction.editReply({ embeds: [embed], ephemeral: true });
    const title = serverqueue?.songs[0]?.title;
    embed = new EmbedBuilder()
        .setTitle('Now Playing')
        .setDescription('There is no song in queue right now');
    if (!title) return interaction.editReply({ embeds: [embed], ephemeral: true });
    const songembed = new EmbedBuilder()
        .setTitle('Now Playing')
        .setDescription(`**${serverqueue.songs[0].title}**`);
    await interaction.editReply({ embeds: [songembed] });
}