const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('loop')
		.setDescription('Loops the current song or the queue'),
	async execute() {

	},
};