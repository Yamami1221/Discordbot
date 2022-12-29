const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('remove')
		.setDescription('Removes a song from the queue')
		.addIntegerOption(option =>
			option.setName('position')
				.setDescription('The position of the song in the queue')
				.setRequired(true)),
	async execute() {

	},
};