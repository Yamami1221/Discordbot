const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('random')
		.setDescription('Random number generator')
        .addIntegerOption(option =>
            option.setName('min')
                .setDescription('The minimum number')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('max')
                .setDescription('The maximum number')
                .setRequired(true)),
	async execute(interaction) {
        var min = interaction.options.getInteger('min');
        var max = interaction.options.getInteger('max');
        if (min > max) {
            var temp = min;
            min = max;
            max = temp;
        }
        var random = Math.floor(Math.random() * max) + min;
		await interaction.reply(`The random number between ${min} and ${max} is ${random}!`);
	},
};