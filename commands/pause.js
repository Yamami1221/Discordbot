const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pause')
		.setDescription('Pauses the current song'),
	async execute() {

	},
};