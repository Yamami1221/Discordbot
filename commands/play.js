const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, StreamType } = require('@discordjs/voice');
const { yt_validate, video_basic_info, stream } = require('play-dl');
const ytdl = require('ytdl-core');
const ytsr = require('ytsr');


const { globalqueue, globalresource } = require('../global.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Play music by providing a link or search')
		.addStringOption(option =>
			option.setName('query')
				.setDescription('The link or search query')
				.setRequired(true)),
	async execute(interaction) {
		// playtest(interaction);
		play(interaction);
	},
};

async function isValidYoutubeUrl(url) {
	const regex = new RegExp(
		// eslint-disable-next-line no-useless-escape
		/^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/,
	);
	return regex.test(url);
}

async function isValidURL(url) {
	if (yt_validate(url) === 'video' || yt_validate(url) === 'playlist') {
		return true;
	} else {
		return false;
	}
}

// async function playtest(interaction) {
// 	const link = interaction.options.getString('link');
// 	if (!isValidYoutubeUrl(link) && isValidURL(link)) {
// 		return interaction.editReply({ content: 'Please enter a valid link', ephemeral: true });
// 	}
// 	const songstream = await stream(link, { discordPlayerCompatibility : true });
// 	const voicechannel = interaction.member.voice.channel;
// 	const connection = joinVoiceChannel({
// 		channelId: voicechannel.id,
// 		guildId: voicechannel.guild.id,
// 		adapterCreator: voicechannel.guild.voiceAdapterCreator,
// 	});
// 	const player = createAudioPlayer();
// 	const resource = createAudioResource(songstream.stream, { inputType: StreamType.Arbitrary });
// 	player.play(resource);
// 	connection.subscribe(player);
// 	player.on(AudioPlayerStatus.Idle, () => {
// 		connection.destroy();
// 	});
// 	await interaction.editReply({ content: 'Playing song' });
// }

async function play(interaction) {
	interaction.deferReply();
	let link = interaction.options.getString('query');
	if (!isValidYoutubeUrl(link) && isValidURL(link)) {
		link = search(interaction);
		if (!link) {
			return;
		}
	}
	const serverqueue = globalqueue.get(interaction.guild.id);
	const voicechannel = interaction.member.voice.channel;
	if (!voicechannel) return interaction.editReply({ content: 'You need to be in a voice channel to play music!' });
	const permissions = voicechannel.permissionsFor(interaction.client.user);
	if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
		return interaction.editReply({ content: 'I need the permissions to join and speak in your voice channel!' });
	}
	const songinfo1 = await video_basic_info(link);
	const songinfo2 = await ytdl.getBasicInfo(link);
	const song = {
		title: songinfo1.video_details.title,
		url: songinfo2.videoDetails.video_url,
	};
	if (!serverqueue) {
		const queueconstruct = {
			textchannel: interaction.channel,
			voicechannel: voicechannel,
			connection: null,
			songs: [],
			volume: 50,
			player: null,
			playing: true,
			loop: false,
			shuffle: false,
		};
		globalqueue.set(interaction.guild.id, queueconstruct);
		queueconstruct.songs.push(song);
		interaction.editReply({ content: `**${song.title}** has been added to the queue!` });
		try {
			const connection = joinVoiceChannel({
				channelId: voicechannel.id,
				guildId: voicechannel.guild.id,
				adapterCreator: voicechannel.guild.voiceAdapterCreator,
			});
			queueconstruct.connection = connection;
			await playSong(interaction, queueconstruct.songs[0]);
		}
		catch (error) {
			console.error(error);
			queueconstruct.songs = [];
			return interaction.editReply({ content: `There was an error connecting: ${error}`, ephemeral: true });
		}
	} else {
		serverqueue.songs.push(song);
		return interaction.editReply({ content: `**${song.title}** has been added to the queue!` });
	}
}

async function playSong(interaction, song) {
	const serverqueue = globalqueue.get(interaction.guild.id);
	if (!song) {
		serverqueue.connection.destroy();
		return;
	}
	const songstream = await stream(song.url, { discordPlayerCompatibility : true });
	const sresource = createAudioResource(songstream.stream, { inputType: StreamType.Arbitrary, inlineVolume: true });
	sresource.volume.setVolume(serverqueue.volume / 100);
	globalresource.set(interaction.guild.id, sresource);
	const player = createAudioPlayer();
	const useresource = globalresource.get(interaction.guild.id);
	player.play(useresource);
	serverqueue.connection.subscribe(player);
	player.on(AudioPlayerStatus.Idle, () => {
		serverqueue.songs.shift();
		playSong(interaction, serverqueue.songs[0]);
	});
	await interaction.channel.send({ content: `Now playing **${song.title}**` });
}

async function search(interaction) {
	const songname = interaction.options.getString('query');
	const song = await ytsr(songname, { limit: 1 });
	if (!song.items[0]) return interaction.editReply({ content: 'I could not find that song!', ephemeral: true });
	const songurl = song.items[0].url;
	return songurl;
}