const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('paly a song')
		.addStringOption(option =>
			option.setName('link')
				.setDescription('The song you want to play')
				.setRequired(true)),
	async execute(interaction) {
		var link = interaction.options.getString('link');
		console.log(link);
		await interaction.reply({ content: 'This command is not available', ephemeral: true });
	},
};