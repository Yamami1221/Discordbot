const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { createAudioResource, StreamType } = require('@discordjs/voice');
const { stream } = require('play-dl');

const { globaldata } = require('../data/global');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('seek')
        .setDescription('Seeks to a specific time in the current song')
        .setDMPermission(false)
        .addIntegerOption((option) =>
            option.setName('time')
                .setDescription('The time to seek to')
                .setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply();
        seek(interaction);
    },
};

async function seek(interaction) {
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
        .setTitle('Seek')
        .setDescription('you need to be in a voice channel to use this command!');
    if (!connection) return interaction.editReply({ embeds: [embed], ephemeral: true });
    const serverdata = globaldata.get(interaction.guild.id);
    embed = new EmbedBuilder()
        .setTitle('Seek')
        .setDescription('This server is not enabled for music commands!');
    if (!serverdata) return interaction.editReply({ embeds: [embed], ephemeral: true });
    const enabled = serverdata.textchannel.find((channel) => channel.id === interaction.channel.id);
    embed = new EmbedBuilder()
        .setTitle('Seek')
        .setDescription('This channel is not enabled for music commands!');
    if (!enabled) return interaction.editReply({ embeds: [embed], ephemeral: true });
    embed = new EmbedBuilder()
        .setTitle('Seek')
        .setDescription('There are no songs in the queue!');
    if (!serverdata.songs[0]) return interaction.editReply({ embeds: [embed], ephemeral: true });
    const time = interaction.options.getInteger('time');
    const song = serverdata.songs[0];
    embed = new EmbedBuilder()
        .setTitle('Seek')
        .setDescription(`The song is only **${song.durationInSeconds}** seconds long!`);
    if (time > song.durationInSeconds) return interaction.editReply({ embeds: [embed], ephemeral: true });
    const songstream = await stream(song.url, { discordPlayerCompatibility : true, quality: 2, seek: time });
    serverdata.resource = createAudioResource(songstream.stream, { inputType: StreamType.Arbitrary, inlineVolume: true });
    serverdata.resource.volume.setVolume(serverdata.volume / 100);
    serverdata.player.play(serverdata.resource);
    serverdata.connection.subscribe(serverdata.player);
    embed = new EmbedBuilder()
        .setTitle('Seek')
        .setDescription(`Song:${song.title}\nSeeked to **${time}/${song.durationInSeconds}** seconds!`);
    await interaction.editReply({ embeds: [embed] });
}