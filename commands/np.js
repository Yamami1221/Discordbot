const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('np')
		.setDescription('Shows the current song'),
	async execute() {

	},
};