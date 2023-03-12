const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const { globaldata } = require('../data/global');

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
    const serverdata = globaldata.get(interaction.guild.id);
    const voicechannel = interaction.member.voice.channel;
    let embed = new EmbedBuilder()
        .setTitle('Jump')
        .setDescription('You need to be in a voice channel to use this command!');
    if (!voicechannel) return interaction.editReply({ embeds: [embed], ephemeral: true });
    embed = new EmbedBuilder()
        .setTitle('Jump')
        .setDescription('This server is not enabled for music commands');
    if (!serverdata) return interaction.editReply({ embeds: [embed], ephemeral: true });
    const enabled = serverdata.textchannel.find((channel) => channel.id === interaction.channel.id);
    embed = new EmbedBuilder()
        .setTitle('Jump')
        .setDescription('This channel is not enabled for music commands');
    if (!enabled) return interaction.editReply({ embeds: [embed], ephemeral: true });
    embed = new EmbedBuilder()
        .setTitle('Jump')
        .setDescription('There is no song in queue right now');
    if (!serverdata.songs[0]) return interaction.editReply({ embeds: [embed], ephemeral: true });
    const jumpto = interaction.options.getInteger('position');
    if (jumpto > serverdata.songs.length) return interaction.editReply({ content: 'There is no song at that position!', ephemeral: true });
    serverdata.songs = serverdata.songs.slice(jumpto - 1);
    const song = serverdata.songs[0];
    serverdata.player.stop();
    serverdata.loop = false;
    embed = new EmbedBuilder()
        .setTitle('Jump')
        .setDescription(`Jumped to **${song.title}**`);
    await interaction.editReply({ embeds: [embed] });
}