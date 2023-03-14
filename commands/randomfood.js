const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('randomfood')
        .setDescription('Random food generator'),
    async execute(interaction) {
        const foodarrayraw = fs.readFileSync('./data/food.txt', 'utf8');
        const foodarray = foodarrayraw.split('\n');
        for (let i = 0; i < foodarray.length; i++) {
            foodarray[i] = foodarray[i].trim();
        }
        console.log(foodarray);
        const jsonToWrite = JSON.stringify(foodarray);
        console.log(jsonToWrite);
        fs.writeFile('./data/fooddata.json', jsonToWrite, err => {
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
    },
};