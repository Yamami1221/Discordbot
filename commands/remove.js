const { SlashCommandBuilder } = require('discord.js');

const { globalqueue } = require('../global.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('remove')
		.setDescription('Removes a song from the queue')
		.addIntegerOption(option =>
			option.setName('position')
				.setDescription('The position of the song in the queue')
				.setRequired(true)),
	async execute(interaction) {
		remove(interaction);
	},
};

async function remove(interaction) {
	await interaction.deferReply();
	const serverqueue = globalqueue.get(interaction.guild.id);
	if (!serverqueue) return interaction.editReply({ content: 'There is no song that I could remove!', ephemeral: true });
	const index = interaction.options.getInteger('position');
	if (index > serverqueue.songs.length) return interaction.editReply({ content: 'There is no song at that index!', ephemeral: true });
	serverqueue.songs.splice(index - 1, 1);
	await interaction.editReply({ content: `Removed the song at index ${index}!` });
}