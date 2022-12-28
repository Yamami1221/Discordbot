const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('Remove a song from the queue')
        .addIntegerOption(option => option.setName('index')
            .setDescription('The position of the song in the queue')
            .setRequired(true)),
    async execute() {

    },
};