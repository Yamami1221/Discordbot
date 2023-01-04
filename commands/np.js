const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const { globalqueue } = require('../global.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('np')
		.setDescription('Shows the current song'),
	async execute(interaction) {
		nowplaying(interaction);
	},
};

async function nowplaying(interaction) {
	await interaction.deferReply();
	const serverqueue = globalqueue.get(interaction.guild.id);
	if (!serverqueue) return interaction.editReply({ content: 'There is no song that I could show!', ephemeral: true });
	const songembed = new EmbedBuilder()
		.setTitle('Now Playing')
		.setDescription(`**${serverqueue.songs[0].title}**`)
		.setColor('#ff8400');
	await interaction.editReply({ embeds: [songembed] });
}