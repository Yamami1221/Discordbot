const { SlashCommandBuilder } = require('discord.js');

const { globalqueue } = require('../global.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('shuffle')
		.setDescription('Shuffles the queue'),
	async execute(interaction) {
		shuffle(interaction);
	},
};

async function shuffle(interaction) {
	await interaction.deferReply();
	const serverqueue = globalqueue.get(interaction.guild.id);
	if (!serverqueue) return interaction.editReply({ content: 'There is no song that I could shuffle!', ephemeral: true });
	serverqueue.songs = shuffleArray(serverqueue.songs);
	await interaction.editReply({ content: 'Shuffled the queue!' });
}

function shuffleArray(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}