const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('jump')
		.setDescription('Jumps to a specific song in the queue')
		.addIntegerOption(option =>
			option.setName('position')
				.setDescription('The time to jump to')
				.setRequired(true)),
	async execute() {

	},
};