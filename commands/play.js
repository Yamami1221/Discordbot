const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Play music by providing a link or search')
		.addStringOption(option =>
			option.setName('query')
				.setDescription('The link or search query')
				.setRequired(true)),
	async execute() {

	},
};