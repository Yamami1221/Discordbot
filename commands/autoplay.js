const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');

const { globaldata } = require('../data/global');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('autoplay')
        .setDescription('Toggle autoplay on/off')
        .addBooleanOption(option =>
            option.setName('toggle')
                .setDescription('Toggle autoplay on/off')
                .setRequired(true)),
    async execute(interaction) {
        const serverData = globaldata.get(interaction.guildId) || undefined;
        if (serverData?.veriChannel) {
            if (interaction.channel.id === serverData.veriChannel.id) {
                const embed = new EmbedBuilder()
                    .setTitle('Verification')
                    .setDescription('You cannot use this command in the verification channel');
                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }
        }
        const toggle = interaction.options.getBoolean('toggle');
        serverData.autoplay = toggle;
        if (toggle) {
            const embed = new EmbedBuilder()
                .setTitle('Autoplay')
                .setDescription('Autoplay is now on');
            await interaction.reply({ embeds: [embed] });
        } else {
            const embed = new EmbedBuilder()
                .setTitle('Autoplay')
                .setDescription('Autoplay is now off');
            await interaction.reply({ embeds: [embed] });
        }
        const mapToWrite = new Map([...globaldata]);
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
                const embed = new EmbedBuilder()
                    .setTitle('Enable')
                    .setDescription('There has been an error saving your configuration data.');
                interaction.editReply({ embeds: [embed] });
                return;
            }
        });
    },
};