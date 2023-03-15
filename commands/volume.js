const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');

const { globaldata } = require('../data/global');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('Sets the volume of the player')
        .addIntegerOption(option =>
            option.setName('volume')
                .setDescription('The volume to set the player to')
                .setMinValue(0)
                .setMaxValue(200)
                .setRequired(true)),
    async execute(interaction) {
        volume(interaction);
    },
};

async function volume(interaction) {
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
        .setTitle('Volume')
        .setDescription('You need to be in a voice channel to use this command!');
    if (!voicechannel) return interaction.editReply({ embeds: [embed], ephemeral: true });
    const serverdata = globaldata.get(interaction.guild.id);
    embed = new EmbedBuilder()
        .setTitle('Volume')
        .setDescription('This server is not enabled for music commands!');
    if (!serverdata) return interaction.editReply({ embeds: [embed], ephemeral: true });
    const enabled = serverdata.textchannel.find((channel) => channel.id === interaction.channel.id);
    embed = new EmbedBuilder()
        .setTitle('Volume')
        .setDescription('This channel is not enabled for music commands!');
    if (!enabled) return interaction.editReply({ embeds: [embed], ephemeral: true });
    const volumes = interaction.options.getInteger('volume');
    embed = new EmbedBuilder()
        .setTitle('Volume')
        .setDescription('The volume must be between 0 and 200!');
    if (volumes > 200 || volumes < 0) return interaction.editReply({ embeds: [embed], ephemeral: true });
    serverdata.volume = volumes;
    if (serverdata.playing) {
        await serverdata.resource.volume.setVolume(serverdata.volume / 100);
    }
    embed = new EmbedBuilder()
        .setTitle('Volume')
        .setDescription(`Set the volume to ${volumes}!`);
    const mapToWrite = new Map(globaldata);
    mapToWrite.forEach((value) => {
        value.songs = [];
        value.connection = null;
        value.player = null;
        value.resource = null;
    });
    const objToWrite = Object.fromEntries(mapToWrite);
    const jsonToWrite = JSON.stringify(objToWrite);
    fs.writeFile('./data/data.json', jsonToWrite, err => {
        if (err) {
            console.log('There has been an error saving your configuration data.');
            console.log(err.message);
            const errembed = new EmbedBuilder()
                .setTitle('Enable')
                .setDescription('There has been an error saving your configuration data.');
            interaction.editReply({ embeds: [errembed] });
            return;
        }
    });
    await interaction.editReply({ embeds: [embed] });
}
