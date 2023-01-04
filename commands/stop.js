const { SlashCommandBuilder } = require('discord.js');

const { globalqueue, globalresource } = require('../global.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stop')
		.setDescription('Stops the music and clears the queue'),
	async execute(interaction) {
		stop(interaction);
	},
};

async function stop(interaction) {
	await interaction.deferReply();
	const serverqueue = globalqueue.get(interaction.guild.id);
	const useresource = globalresource.get(interaction.guild.id);
	if (!serverqueue) return interaction.editReply({ content: 'There is no song that I could stop!', ephemeral: true });
	serverqueue.songs = [];
	serverqueue.connection.destroy();
	useresource.stop();
	await interaction.editReply({ content: 'Stopped the music!' });
}