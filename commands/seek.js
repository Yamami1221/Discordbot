const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('seek')
		.setDescription('Seeks to a specific time in the current song')
		.addIntegerOption(option =>
			option.setName('time')
				.setDescription('The time to seek to')
				.setRequired(true)),
	async execute() {

	},
};