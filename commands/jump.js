const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('jump')
		.setDescription('Jumps to a specific time in the current song')
		.addIntegerOption(option =>
			option.setName('time')
				.setDescription('The time to jump to')
				.setRequired(true)),
	async execute() {

	},
};