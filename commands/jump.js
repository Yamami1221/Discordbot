const { SlashCommandBuilder } = require('discord.js');

const { globalqueue } = require('../global.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('jump')
		.setDescription('Jumps to a specific song in the queue')
		.addIntegerOption(option =>
			option.setName('position')
				.setDescription('The time to jump to')
				.setRequired(true)),
	async execute(interaction) {
		jump(interaction);
	},
};

async function jump(interaction) {
	await interaction.deferReply();
	const serverqueue = globalqueue.get(interaction.guild.id);
	if (!serverqueue) return interaction.editReply({ content: 'There is no song that I could jump to!', ephemeral: true });
	const jumpto = interaction.options.getInteger('position');
	if (jumpto > serverqueue.songs.length) return interaction.editReply({ content: 'There is no song at that index!', ephemeral: true });
	serverqueue.songs = serverqueue.songs.slice(jumpto - 1);
	serverqueue.connection.destroy();
	await interaction.editReply({ content: `Jumped to the song at index ${jumpto}!` });
}