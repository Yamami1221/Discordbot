const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('nowplaying')
		.setDescription('Shows the current song'),
	async execute() {

	},
};