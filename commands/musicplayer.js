const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, StreamType } = require('@discordjs/voice');
const { stream, video_basic_info, yt_validate } = require('play-dl');
const ytdl = require('ytdl-core');
const ytsr = require('ytsr');

const globalqueue = new Map();
const globalresource = new Map();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('musicplayer')
		.setDescription('Music Player')
		.addSubcommand(subcommand =>
			subcommand
				.setName('play')
				.setDescription('Play a song')
				.addStringOption(option =>
					option.setName('link')
						.setDescription('Link to play')
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('stop')
				.setDescription('Stop the music'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('skip')
				.setDescription('Skip the current song'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('queue')
				.setDescription('Show the queue'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('pause')
				.setDescription('Pause the music'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('resume')
				.setDescription('Resume the music'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('loop')
				.setDescription('Loop the music'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('shuffle')
				.setDescription('Shuffle the queue'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('remove')
				.setDescription('Remove a song from the queue')
				.addIntegerOption(option =>
					option.setName('position')
						.setDescription('Position of the song in the queue')
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('nowplaying')
				.setDescription('Show the current song'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('volume')
				.setDescription('Change the volume')
				.addIntegerOption(option =>
					option.setName('volume')
						.setDescription('Volume to set')
						.setMinValue(0)
						.setMaxValue(100)
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('seek')
				.setDescription('Seek to a specific time in the song')
				.addIntegerOption(option =>
					option.setName('time')
						.setDescription('Time to seek to')
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('search')
				.setDescription('Search for a song')
				.addStringOption(option =>
					option.setName('name')
						.setDescription('Name of the song to search')
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('lyrics')
				.setDescription('Show the lyrics of the current song'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('jump')
				.setDescription('Jump to a specific song in the queue')
				.addIntegerOption(option =>
					option.setName('position')
						.setDescription('Position of the song in the queue')
						.setRequired(true))),
	async execute(interaction) {
		const subcommand = interaction.options.getSubcommand();
		interaction.deferReply();


		if (subcommand === 'play') {
			// playtest(interaction);
			play(interaction);
		} else if (subcommand === 'stop') {
			stop(interaction);
		} else if (subcommand === 'skip') {
			skip(interaction);
		} else if (subcommand === 'queue') {
			queue(interaction);
		} else if (subcommand === 'pause') {
			pause(interaction);
		} else if (subcommand === 'resume') {
			resume(interaction);
		} else if (subcommand === 'loop') {
			loop(interaction);
		} else if (subcommand === 'shuffle') {
			shuffle(interaction);
		} else if (subcommand === 'remove') {
			remove(interaction);
		} else if (subcommand === 'nowplaying') {
			nowplaying(interaction);
		} else if (subcommand === 'volume') {
			volume(interaction);
		} else if (subcommand === 'seek') {
			seek(interaction);
		} else if (subcommand === 'search') {
			search(interaction);
		} else if (subcommand === 'lyrics') {
			lyrics(interaction);
		} else if (subcommand === 'jump') {
			jump(interaction);
		}
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
	const link = interaction.options.getString('link');
	if (!isValidYoutubeUrl(link) && isValidURL(link)) {
		return interaction.editReply({ content: 'Please enter a valid link', ephemeral: true });
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
			volume: 100,
			playing: true,
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
			globalqueue.delete(interaction.guild.id);
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
		globalqueue.delete(interaction.guild.id);
		return;
	}
	const songstream = await stream(song.url, { discordPlayerCompatibility : true });
	console.log(songstream.stream);
	console.log(songstream);
	const sresource = createAudioResource(songstream.stream, { inputType: StreamType.Arbitrary });
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

async function stop(interaction) {
	const serverqueue = globalqueue.get(interaction.guild.id);
	if (!serverqueue) return interaction.editReply({ content: 'There is no song that I could stop!', ephemeral: true });
	serverqueue.songs = [];
	serverqueue.connection.destroy();
	globalqueue.delete(interaction.guild.id);
	await interaction.editReply({ content: 'Stopped the music!' });
}

async function skip(interaction) {
	const serverqueue = globalqueue.get(interaction.guild.id);
	if (!serverqueue) return interaction.editReply({ content: 'There is no song that I could skip!', ephemeral: true });
	serverqueue.connection.destroy();
	await interaction.editReply({ content: 'Skipped the song!' });
}

async function queue(interaction) {
	const serverqueue = globalqueue.get(interaction.guild.id);
	if (!serverqueue) return interaction.editReply({ content: 'There is no song in the queue!', ephemeral: true });
	const queueembed = new EmbedBuilder()
		.setTitle('Server Queue')
		.setDescription(serverqueue.songs.map(song => `**-** ${song.title}`).join('\n'))
		.setColor('#ff8400');
	await interaction.editReply({ embeds: [queueembed] });
}

async function pause(interaction) {
	const serverqueue = globalqueue.get(interaction.guild.id);
	if (!serverqueue) return interaction.editReply({ content: 'There is no song that I could pause!', ephemeral: true });
	serverqueue.connection.pause();
	await interaction.editReply({ content: 'Paused the music!' });
}

async function resume(interaction) {
	const serverqueue = globalqueue.get(interaction.guild.id);
	if (!serverqueue) return interaction.editReply({ content: 'There is no song that I could resume!', ephemeral: true });
	serverqueue.connection.unpause();
	await interaction.editReply({ content: 'Resumed the music!' });
}

async function loop(interaction) {
	const serverqueue = globalqueue.get(interaction.guild.id);
	if (!serverqueue) return interaction.editReply({ content: 'There is no song that I could loop!', ephemeral: true });
	serverqueue.connection.loop(true);
	await interaction.editReply({ content: 'Looped the music!' });
}

async function shuffle(interaction) {
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

async function remove(interaction) {
	const serverqueue = globalqueue.get(interaction.guild.id);
	if (!serverqueue) return interaction.editReply({ content: 'There is no song that I could remove!', ephemeral: true });
	const index = interaction.options.getInteger('position');
	if (index > serverqueue.songs.length) return interaction.editReply({ content: 'There is no song at that index!', ephemeral: true });
	serverqueue.songs.splice(index - 1, 1);
	await interaction.editReply({ content: `Removed the song at index ${index}!` });
}

async function volume(interaction) {
	const serverqueue = globalqueue.get(interaction.guild.id);
	const useresource = globalresource.get(interaction.guild.id);
	if (!serverqueue) return interaction.editReply({ content: 'There is no song that I could change the volume of!', ephemeral: true });
	const volumes = interaction.options.getInteger('volume');
	if (volumes > 200 || volumes < 0) return interaction.editReply({ content: 'The volume must be between 0 and 200!', ephemeral: true });
	serverqueue.volume = volumes;
	useresource.volume.setVolume(volumes / 100);
	await interaction.editReply({ content: `Set the volume to ${volumes}!` });
}

async function nowplaying(interaction) {
	const serverqueue = globalqueue.get(interaction.guild.id);
	if (!serverqueue) return interaction.editReply({ content: 'There is no song that I could show!', ephemeral: true });
	const songembed = new EmbedBuilder()
		.setTitle('Now Playing')
		.setDescription(`**${serverqueue.songs[0].title}**`)
		.setColor('#ff8400');
	await interaction.editReply({ embeds: [songembed] });
}

async function seek(interaction) {
	const serverqueue = globalqueue.get(interaction.guild.id);
	if (!serverqueue) return interaction.editReply({ content: 'There is no song that I could seek!', ephemeral: true });
	const seektime = interaction.options.getInteger('time');
	if (seektime > serverqueue.songs[0].duration) return interaction.editReply({ content: 'You cannot seek past the end of the song!', ephemeral: true });
	serverqueue.connection.seek(seektime * 1000);
	await interaction.editReply({ content: `Seeked to ${seektime} seconds!` });
}

async function jump(interaction) {
	const serverqueue = globalqueue.get(interaction.guild.id);
	if (!serverqueue) return interaction.editReply({ content: 'There is no song that I could jump to!', ephemeral: true });
	const jumpto = interaction.options.getInteger('position');
	if (jumpto > serverqueue.songs.length) return interaction.editReply({ content: 'There is no song at that index!', ephemeral: true });
	serverqueue.songs = serverqueue.songs.slice(jumpto - 1);
	serverqueue.connection.destroy();
	await interaction.editReply({ content: `Jumped to the song at index ${jumpto}!` });
}

async function lyrics(interaction) {
	const songname = interaction.options.getString('song');
	const song = await ytsr(songname, { limit: 1 });
	if (!song.items[0]) return interaction.editReply({ content: 'I could not find that song!', ephemeral: true });
	const songurl = song.items[0].url;
	const songlyrics = await lyricsFinder(songurl);
	if (!songlyrics) return interaction.editReply({ content: 'I could not find the lyrics for that song!', ephemeral: true });
	const lyricsembed = new EmbedBuilder()
		.setTitle(`Lyrics for ${songname}`)
		.setDescription(songlyrics)
		.setColor('#ff8400');
	await interaction.editReply({ embeds: [lyricsembed] });
}

function lyricsFinder(url) {
	return new Promise((resolve, reject) => {
		const lyricss = lyricsFinder(url, '');
		if (!lyricss) reject('No lyrics found');
		resolve(lyricss);
	});
}

async function search(interaction) {
	const songname = interaction.options.getString('song');
	const song = await ytsr(songname, { limit: 1 });
	if (!song.items[0]) return interaction.editReply({ content: 'I could not find that song!', ephemeral: true });
	const songurl = song.items[0].url;
	const songembed = new EmbedBuilder()
		.setTitle(`Search results for ${songname}`)
		.setDescription(`[Click here to play ${songname}](${songurl})`)
		.setColor('#ff8400');
	await interaction.editReply({ embeds: [songembed] });
}