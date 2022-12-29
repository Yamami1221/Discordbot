const { SlashCommandBuilder, EmbedBuilder, Client } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stats')
		.setDescription('Shows the stats of the bot'),
	async execute(interaction) {
		const client = Client();
		const embed = new EmbedBuilder()
			.setTitle('Stats')
			.setDescription(`Stats of the bot:\n\nServers: ${client.guilds.cache.size}\nUsers: ${client.users.cache.size}\nChannels: ${client.channels.cache.size}\n\n(These are the current stats, they may not be accurate.)`)
			.setColor('#FF0000')
			.setTimestamp();
		await interaction.reply({ embeds: [embed] });
	},
};