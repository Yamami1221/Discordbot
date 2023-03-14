const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');

const { globaldata } = require('../data/global');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('randomfood')
        .setDescription('Random food generator'),
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
        const foodarrayraw = fs.readFileSync('./data/fooddata.json');
        const foodarray = JSON.parse(foodarrayraw);
        const randomfood = foodarray[Math.floor(Math.random() * foodarray.length)];
        const embed = new EmbedBuilder()
            .setTitle('Random Food Generator')
            .setDescription(`You should eat ${randomfood}`);
        await interaction.editReply({ embeds: [embed] });
    },
};