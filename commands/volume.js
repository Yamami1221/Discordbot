const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('change the volume of the music')
        .addIntegerOption(option =>
            option.setName('volume')
                .setDescription('the volume to set')
                .setRequired(true)),
    async execute() {

    },
};