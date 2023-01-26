const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

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
            const embed = new EmbedBuilder()
                .setTitle('Horoscope')
                .setDescription(`Your horoscope for today is ${horouserdata.result}`);
            await interaction.editReply({ embeds: [embed] });
            return;
        } else {
            const horodatatosave = {
                result: horodata[Math.floor(Math.random() * horodata.length)],
            };
            horomap.set(interaction.user.id, horodatatosave);
            const embed = new EmbedBuilder()
                .setTitle('Horoscope')
                .setDescription(`Your horoscope for today is ${horodatatosave.result}`);
            await interaction.editReply({ embeds: [embed] });
            return;
        }
    },
};
