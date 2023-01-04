const { SlashCommandBuilder } = require('discord.js');

const { globalqueue, globalresource } = require('../global.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('resume')
		.setDescription('Resumes the current song'),
	async execute(interaction) {
		resume(interaction);
	},
};

async function resume(interaction) {
	await interaction.deferReply();
	const serverqueue = globalqueue.get(interaction.guild.id);
	const useresource = globalresource.get(interaction.guild.id);
	if (!serverqueue) return interaction.editReply({ content: 'There is no song that I could resume!', ephemeral: true });
	useresource.unpause();
	await interaction.editReply({ content: 'Resumed the music!' });
}