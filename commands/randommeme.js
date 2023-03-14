const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('randommeme')
        .setDescription('Random meme generator'),
    async execute(interaction) {
        console.log('randommeme command executed');
        console.log(interaction);
    },
};