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
    const enabled = serverdata.textchannel.find((channel) => channel.id === interaction.channel.id);
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
        .setDescription(`Now playing: **${serverdata.songs[0].title}**`);
    let songstring = '';
    for (let i = 1; i < serverdata.songs.length; i++) {
        songstring += `${i}. ${serverdata.songs[i].title}\n`;
    }
    if (songstring.length > 1024) songstring = songstring.slice(0, 1021) + '...';
    if (songstring === '') songstring = 'Nothing in the queue';
    queueembed.addFields({ name: 'Songs', value: songstring, inline: true });
    const optionstring = `**Playing:** ${serverdata.playing}\n**Looping:** ${serverdata.looping}\n**Autoplay:** ${serverdata.autoplay}\n**Volume:** ${serverdata.volume}`;
    queueembed.addFields({ name: 'Options', value: optionstring, inline: true });
    await interaction.editReply({ embeds: [queueembed] });
}