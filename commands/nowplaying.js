const { SlashCommandBuilder } = require('discord.js');  

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('Show the current song'),
    async execute() {

    },
};