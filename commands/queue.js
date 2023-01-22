const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const { globalqueue } = require('../global.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Shows the current queue'),
    async execute(interaction) {
        queue(interaction);
    },
};

async function queue(interaction) {
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
    const voicechannel = interaction.member.voice.channel;
    let embed = new EmbedBuilder()
        .setTitle('Queue')
        .setDescription('You need to be in a voice channel to use this command!');
    if (!voicechannel) return interaction.editReply({ embeds: [embed], ephemeral: true });
    const serverqueue = globalqueue.get(interaction.guild.id);
    embed = new EmbedBuilder()
        .setTitle('Queue')
        .setDescription('This server is not enabled music commands!');
    if (!serverqueue) return interaction.editReply({ embeds: [embed], ephemeral: true });
    let enabled = false;
    for (let i = 0; i < serverqueue.textchannels.length; i++) {
        if (serverqueue.textchannels[i].id == interaction.channel.id) {
            enabled = true;
            break;
        }
    }
    embed = new EmbedBuilder()
        .setTitle('Queue')
        .setDescription('This channel is not enabled music commands!');
    if (!enabled) return interaction.editReply({ embeds: [embed], ephemeral: true });
    embed = new EmbedBuilder()
        .setTitle('Queue')
        .setDescription('There is nothing in the queue!');
    if (!serverqueue.songs[0]) return interaction.editReply({ embeds: [embed], ephemeral: true });
    const queueembed = new EmbedBuilder()
        .setTitle('Queue')
        .setDescription(`Now playing: ${serverqueue.songs[0].title}`);
    for (let i = 1; i < serverqueue.songs.length; i++) {
        queueembed.addFields({ name:`Song ${i}`, value:serverqueue.songs[i].title });
    }
    await interaction.editReply({ embeds: [queueembed] });
}