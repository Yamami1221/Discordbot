const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('volume')
		.setDescription('Sets the volume of the player')
		.addIntegerOption(option =>
			option.setName('volume')
				.setDescription('The volume to set the player to')
				.setMinValue(0)
				.setMaxValue(200)
				.setRequired(true)),
	async execute() {

	},
};