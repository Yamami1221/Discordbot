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
		var link = interaction.options.getString('link');
		if (!isValideLink(link)) {
			await interaction.reply({ content: 'This is not a valide link', ephemeral: true });
			return;
		}
		await addSongToQueue(interaction, link);
		await connectToVoiceChannel(interaction);
		await playSong(interaction);
		console.log(link);
		await interaction.reply({ content: 'This command is not available', ephemeral: true });
	},
};

async function isValideLink(link) {
	return ytdl.validateURL(link);
}

async function addSongToQueue(interaction, link) {
	var songInfo = await ytdl.getInfo(link);
	var song = {
		title: songInfo.videoDetails.title,
		url: songInfo.videoDetails.video_url,
	};
	var serverQueue = globalqueue.get(interaction.guild.id);
	if (!serverQueue) {
		var queueConstruct = {
			textChannel: interaction.channel,
			connection: null,
			songs: [],
			volume: 5,
			playing: true,
		};
		queueConstruct.songs.push(song);
		globalqueue.set(interaction.guild.id, queueConstruct);
		interaction.reply({ content: `Song:${song.title} Has been add`, ephemeral: false });
	} else {
		serverQueue.songs.push(song);
		interaction.reply({ content: `Song:${song.title} Has been add`, ephemeral: false });
	}
}

async function connectToVoiceChannel(interaction) {
	const channel = interaction.member.voice.channel;
	if (!channel) return await interaction.reply({ content: 'You need to join a voice channel first!', ephemeral: true });
	const permissions = channel.permissionsFor(interaction.client.user);
	if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
		return await interaction.reply({ content: 'I need the permissions to join and speak in your voice channel!', ephemeral: true });
	}
	const connection = joinVoiceChannel({
		channelId: channel.id,
		guildId: channel.guild.id,
		adapterCreator: channel.guild.voiceAdapterCreator,
	});
	try {
		await entersState(connection, VoiceConnectionStatus.Ready, 30e3);
		return connection;
	}
	catch (error) {
		connection.destroy();
		throw error;
	}
}

async function playSong(interaction) {
	const serverQueue = globalqueue.get(interaction.guild.id);
	if (!serverQueue) {
		disconnectFromVoiceChannel(interaction);
		return;
	}
	const song = serverQueue.songs[0];
	const stream = ytdl(song.url, { filter: 'audioonly' });
	const resource = createAudioResource(stream, { inlineVolume: true });
	const player = createAudioPlayer();
	player.play(resource);
	resource.volume.setVolume(serverQueue.volume / 5);
	serverQueue.connection.subscribe(player);
	player.on(AudioPlayerStatus.Idle, () => {
		serverQueue.songs.shift();
		playSong(interaction);
	});
}

async function disconnectFromVoiceChannel(interaction) {
	const serverQueue = globalqueue.get(interaction.guild.id);
	if (!serverQueue) {
		return;
	}
	serverQueue.connection.destroy();
}


