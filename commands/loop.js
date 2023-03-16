const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');

const { globaldata } = require('../data/global');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Loops the current song or the queue')
        .addBooleanOption(option =>
            option
                .setName('loop')
                .setDescription('Whether to loop the queue or not')
                .setRequired(true)),
    async execute(interaction) {
        loop(interaction);
    },
};

async function loop(interaction) {
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
        .setTitle('Loop')
        .setDescription('You need to be in a voice channel to use this command!');
    if (!connection) return interaction.editReply({ embeds: [embed], ephemeral: true });
    const serverdata = globaldata.get(interaction.guild.id);
    embed = new EmbedBuilder()
        .setTitle('Loop')
        .setDescription('This server is not enabled for music commands!');
    if (!serverdata) return interaction.editReply({ embeds: [embed], ephemeral: true });
    const enabled = serverdata.textchannel.find((channel) => channel.id === interaction.channel.id);
    embed = new EmbedBuilder()
        .setTitle('Loop')
        .setDescription('This channel is not enabled for music commands!');
    if (!enabled) return interaction.editReply({ embeds: [embed], ephemeral: true });
    const toggle = interaction.options.getBoolean('loop');
    serverdata.loop = toggle;
    embed = new EmbedBuilder()
        .setTitle('Loop')
        .setDescription(`Looping ${serverdata.loop ? 'enabled' : 'disabled'}`);
    await interaction.editReply({ embeds: [embed] });
    const premapToWrite = new Map([...globaldata]);
    const mapToWrite = new Map([...premapToWrite].map(([key, value]) => [key, Object.assign({}, value)]));
    mapToWrite.forEach((value) => {
        value.songs = [];
        value.connection = null;
        value.player = null;
        value.resource = null;
        value.timervar = null;
    });
    const objToWrite = Object.fromEntries(mapToWrite);
    const jsonToWrite = JSON.stringify(objToWrite);
    fs.writeFile('./data/data.json', jsonToWrite, err => {
        if (err) {
            console.log('There has been an error saving your configuration data.');
            console.log(err.message);
            embed = new EmbedBuilder()
                .setTitle('Enable')
                .setDescription('There has been an error saving your configuration data.');
            interaction.editReply({ embeds: [embed] });
            return;
        }
    });
}