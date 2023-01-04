const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const lyricsFinder = require('lyrics-finder');
const { globalqueue } = require('../global');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('lyrics')
		.setDescription('Shows the lyrics of the current song'),
	async execute(interaction) {
		lyrics(interaction);
	},
};

async function lyrics(interaction) {
	await interaction.deferReply();
	const songname = globalqueue.get(interaction.guild.id).songs[0].title;
	const songlyrics = await lyricsFinders(songname);
	if (!songlyrics) return interaction.editReply({ content: 'I could not find the lyrics for that song!', ephemeral: true });
	const lyricsembed = new EmbedBuilder()
		.setTitle(`Lyrics for ${songname}`)
		.setDescription(songlyrics)
		.setColor('#ff8400');
	await interaction.editReply({ embeds: [lyricsembed] });
}

function lyricsFinders(title) {
	return new Promise((resolve, reject) => {
		const lyricss = lyricsFinder(title, '');
		if (!lyricss) reject('No lyrics found');
		resolve(lyricss);
	});
}