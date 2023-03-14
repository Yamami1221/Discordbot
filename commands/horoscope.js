const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');

const horodata = require('./../resource/horostorage.js');
const { globaldata, horomap } = require('../data/global');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('horoscope')
        .setDescription('Get your horoscope for today'),
    async execute(interaction) {
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
        const horouserdata = horomap.get(interaction.user.id);
        if (horouserdata) {
            const horodatatoshow = horouserdata.result;
            const embed = new EmbedBuilder()
                .setTitle('Horoscope')
                .setDescription(`Your horoscope for today is \`\`\`${horodatatoshow.name} ${horodatatoshow.value}\`\`\``);
            await interaction.editReply({ embeds: [embed] });
            return;
        } else {
            const min = 0;
            const max = 27;
            const random = Math.floor(Math.random() * (max - min + 1)) + min;
            const horodatatosave = {
                result: horodata.data[random],
            };
            horomap.set(interaction.user.id, horodatatosave);
            const embed = new EmbedBuilder()
                .setTitle('Horoscope')
                .setDescription(`Your horoscope for today is \`\`\`${horodatatosave.result.name} ${horodatatosave.result.value}\`\`\``);
            await interaction.editReply({ embeds: [embed] });
            const mapToWrite = new Map(globaldata);
            mapToWrite.forEach((value) => {
                value.connection = null;
                value.player = null;
                value.resource = null;
            });
            const objToWrite = Object.fromEntries(mapToWrite);
            const jsonToWrite = JSON.stringify(objToWrite);
            fs.writeFile('./data/horodata.json', jsonToWrite, err => {
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
            setTimeout(() => {
                horomap.delete(interaction.user.id);
                const mapToWrite2 = new Map(globaldata);
                mapToWrite.forEach((value) => {
                    value.connection = null;
                    value.player = null;
                    value.resource = null;
                });
                const objToWrite2 = Object.fromEntries(mapToWrite2);
                const jsonToWrite2 = JSON.stringify(objToWrite2);
                fs.writeFile('./data/data.json', jsonToWrite2, err => {
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
            }, 86400000);
            return;
        }
    },
};