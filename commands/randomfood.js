const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('randomfood')
        .setDescription('Random food generator'),
    async execute(interaction) {
        await interaction.deferReply();
        const foodarrayraw = fs.readFileSync('./data/fooddata.json');
        const foodarray = JSON.parse(foodarrayraw);
        const randomfood = foodarray[Math.floor(Math.random() * foodarray.length)];
        const embed = new EmbedBuilder()
            .setTitle('Random Food Generator')
            .setDescription(`You should eat ${randomfood}`);
        await interaction.editReply({ embeds: [embed] });
    },
};