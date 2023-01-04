const { SlashCommandBuilder } = require('discord.js');

const { globalqueue } = require('../global.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('loop')
		.setDescription('Loops the current song or the queue'),
	async execute(interaction) {
		loop(interaction);
	},
};

async function loop(interaction) {
	await interaction.deferReply();
	const serverqueue = globalqueue.get(interaction.guild.id);
	if (!serverqueue) return interaction.editReply({ content: 'There is no song that I could loop!', ephemeral: true });
	serverqueue.connection.loop(true);
	await interaction.editReply({ content: 'Looped the music!' });
}