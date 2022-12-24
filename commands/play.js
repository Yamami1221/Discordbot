const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('paly a song'),
	async execute(interaction) {
		await interaction.reply({ content: 'This command is not available', ephemeral: true });
	},
};