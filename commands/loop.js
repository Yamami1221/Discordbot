const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const { globaldata } = require('../data/global');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Loops the current song or the queue'),
    async execute(interaction) {
        loop(interaction);
    },
};

async function loop(interaction) {
    await interaction.deferReply();
    const serverQueue = globaldata.get(interaction.guildId) || undefined;
    if (serverQueue?.veriChannel) {
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
        .setTitle('Loop')
        .setDescription('You need to be in a voice channel to use this command!');
    if (!connection) return interaction.editReply({ embeds: [embed], ephemeral: true });
    const serverqueue = globaldata.get(interaction.guild.id);
    embed = new EmbedBuilder()
        .setTitle('Loop')
        .setDescription('This server is not enabled for music commands!');
    if (!serverqueue) return interaction.editReply({ embeds: [embed], ephemeral: true });
    let enabled = false;
    for (let i = 0; i < serverqueue.textchannels.length; i++) {
        if (serverqueue.textchannels[i] == interaction.channel.id) {
            enabled = true;
            break;
        }
    }
    embed = new EmbedBuilder()
        .setTitle('Loop')
        .setDescription('This channel is not enabled for music commands!');
    if (!enabled) return interaction.editReply({ embeds: [embed], ephemeral: true });
    embed = new EmbedBuilder()
        .setTitle('Loop')
        .setDescription('There is no song in queue right now');
    if (!serverqueue.songs[0]) return interaction.editReply({ embeds: [embed], ephemeral: true });
    serverqueue.loop = !serverqueue.loop;
    if (serverqueue.loop) {
        embed = new EmbedBuilder()
            .setTitle('Loop')
            .setDescription('Looped the queue!');
    } else {
        embed = new EmbedBuilder()
            .setTitle('Loop')
            .setDescription('Unlooped the queue!');
    }
    await interaction.editReply({ embeds: [embed] });
}