const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('np')
        .setDescription('Show the current song'),
    async execute() {

    },
};