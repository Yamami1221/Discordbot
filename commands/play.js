const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, entersState, VoiceConnectionStatus } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const { globalqueue } = require('../index.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('paly a song')
		.addStringOption(option =>
			option.setName('link')
				.setDescription('The song you want to play')
				.setRequired(true)),
	async execute(interaction) {
		await interaction.reply({ content: 'This command is not available', ephemeral: true });
	},
};