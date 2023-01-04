const { SlashCommandBuilder } = require('discord.js');

const { globalqueue, globalresource } = require('../global.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pause')
		.setDescription('Pauses the current song'),
	async execute(interaction) {
		pauses(interaction);
	},
};

async function pauses(interaction) {
	await interaction.deferReply();
	const serverqueue = globalqueue.get(interaction.guild.id);
	const useresource = globalresource.get(interaction.guild.id);
	if (!serverqueue) return interaction.editReply({ content: 'There is no song that I could pause!', ephemeral: true });
	useresource.pause();
	await interaction.editReply({ content: 'Paused the music!' });
}