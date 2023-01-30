const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const { globaldata } = require('../data/global');

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
    const voicechannel = interaction.member.voice.channel;
    let embed = new EmbedBuilder()
        .setTitle('Queue')
        .setDescription('You need to be in a voice channel to use this command!');
    if (!voicechannel) return interaction.editReply({ embeds: [embed], ephemeral: true });
    const serverdata = globaldata.get(interaction.guild.id);
    embed = new EmbedBuilder()
        .setTitle('Queue')
        .setDescription('This server is not enabled music commands!');
    if (!serverdata) return interaction.editReply({ embeds: [embed], ephemeral: true });
    let enabled = false;
    for (let i = 0; i < serverdata.textchannel.length; i++) {
        if (serverdata.textchannels[i].id == interaction.channel.id) {
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
    if (!serverdata.songs[0]) return interaction.editReply({ embeds: [embed], ephemeral: true });
    const queueembed = new EmbedBuilder()
        .setTitle('Queue')
        .setDescription(`Now playing: ${serverdata.songs[0].title}`);
    for (let i = 1; i < serverdata.songs.length; i++) {
        queueembed.addFields({ name:`Song ${i}`, value:serverdata.songs[i].title });
    }
    await interaction.editReply({ embeds: [queueembed] });
}