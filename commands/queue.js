const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const { globalqueue } = require('../global.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('queue')
		.setDescription('Shows the current queue'),
	async execute(interaction) {
		queue(interaction);
	},
};

async function queue(interaction) {
	await interaction.deferReply();
	const serverqueue = globalqueue.get(interaction.guild.id);
	if (!serverqueue) return interaction.editReply({ content: 'There is no song in the queue!', ephemeral: true });
	const queueembed = new EmbedBuilder()
		.setTitle('Server Queue')
		.setDescription(serverqueue.songs.map(song => `**-** ${song.title}`).join('\n'))
		.setColor('#ff8400');
	await interaction.editReply({ embeds: [queueembed] });
}