const { SlashCommandBuilder } = require('discord.js');

const { globalqueue } = require('../global.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('seek')
		.setDescription('Seeks to a specific time in the current song')
		.addIntegerOption(option =>
			option.setName('time')
				.setDescription('The time to seek to')
				.setRequired(true)),
	async execute(interaction) {
		seek(interaction);
	},
};

async function seek(interaction) {
	await interaction.deferReply();
	const serverqueue = globalqueue.get(interaction.guild.id);
	if (!serverqueue) return interaction.editReply({ content: 'There is no song that I could seek!', ephemeral: true });
	const seektime = interaction.options.getInteger('time');
	if (seektime > serverqueue.songs[0].duration) return interaction.editReply({ content: 'You cannot seek past the end of the song!', ephemeral: true });
	serverqueue.connection.seek(seektime * 1000);
	await interaction.editReply({ content: `Seeked to ${seektime} seconds!` });
}