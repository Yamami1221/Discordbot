const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const { globaldata } = require('../data/global');

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
        .setTitle('Now Playing')
        .setDescription('You need to be in a voice channel to use this command!');
    if (!connection) return interaction.editReply({ embeds: [embed], ephemeral: true });
    const serverdata = globaldata.get(interaction.guild.id);
    embed = new EmbedBuilder()
        .setTitle('Now Playing')
        .setDescription('This server is not enabled for music commands!');
    if (!serverdata) return interaction.editReply({ embeds: [embed], ephemeral: true });
    const enabled = serverdata.textchannel.find((channel) => channel.id === interaction.channel.id);
    embed = new EmbedBuilder()
        .setTitle('Now Playing')
        .setDescription('This channel is not enabled for music commands!');
    if (!enabled) return interaction.editReply({ embeds: [embed], ephemeral: true });
    const title = serverdata?.songs[0]?.title;
    embed = new EmbedBuilder()
        .setTitle('Now Playing')
        .setDescription('There is no song in queue right now');
    if (!title) return interaction.editReply({ embeds: [embed], ephemeral: true });
    const songembed = new EmbedBuilder()
        .setTitle('Now Playing')
        .setDescription(`[**${serverdata.songs[0].title}**](${serverdata.songs[0].url})\nSong duration: \`${serverdata.songs[0].durationRaw}\``)
        .setThumbnail(serverdata.songs[0].thumbnail)
        .setFooter({ text: `Requested by ${serverdata.songs[0].requestedBy.tag}`, iconURL: serverdata.songs[0].requestedBy.avatarURL() });
    await interaction.editReply({ embeds: [songembed] });
}