const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');

const horodata = require('./../resource/horostorage.js');
const { globalqueue, horomap } = require('../global.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('horoscope')
        .setDescription('Get your horoscope for today'),
    async execute(interaction) {
        await interaction.deferReply();
        const serverQueue = globalqueue.get(interaction.guildId) || undefined;
        if (serverQueue?.veriChannel) {
            if (interaction.channel.id === serverQueue.veriChannel.id) {
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
                .setDescription(`Your horoscope for today is \`\`\`${horodatatoshow.result.name} ${horodatatoshow.result.value}\`\`\``);
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
            const data = JSON.stringify(horomap, replacer);
            fs.writeFileSync('./horodata.json', data, err => {
                if (err) {
                    console.log('There has been an error saving your configuration data.');
                    console.log(err.message);
                }
            });
            return;
        }
    },
};

function replacer(key, value) {
    if (value instanceof Map) {
        return {
            dataType: 'Map',
            value: Array.from(value.entries()), // or with spread: value: [...value]
        };
    } else {
        return value;
    }
}