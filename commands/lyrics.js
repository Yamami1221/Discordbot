const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('lyrics')
		.setDescription('Shows the lyrics of the current song'),
	async execute() {

	},
};