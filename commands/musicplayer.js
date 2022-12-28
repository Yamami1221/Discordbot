const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, entersState, StreamType, VoiceConnectionStatus } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const ytsr = require('ytsr');

const globalqueue = new Map();

module.exports = {
	data: SlashCommandBuilder()
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
					option.setName('song name')
						.setDescription('Name of the song to search for')
						.setRequired(true))),
	async execute(interaction) {
		const subcommand = interaction.options.getSubcommand();
		if (subcommand === 'play') {
			const link = interaction.options.getString('link');
			addSongToQueue(link, interaction);
		} else if (subcommand === 'stop') {
			const serverQueue = globalqueue.get(interaction.guildId);
			if (!serverQueue) {
				return interaction.reply({ content: 'There is nothing playing!', ephemeral: true });
			}
			serverQueue.songs = [];
			serverQueue.connection.destroy();
			globalqueue.delete(interaction.guildId);
			return interaction.reply({ content: 'The music has been stopped!', ephemeral: false });
		} else if (subcommand === 'skip') {
			const serverQueue = globalqueue.get(interaction.guildId);
			if (!serverQueue) {
				return interaction.reply({ content: 'There is nothing playing!', ephemeral: true });
			}
			serverQueue.connection.destroy();
			return interaction.reply({ content: 'The song has been skipped!', ephemeral: false });
		} else if (subcommand === 'queue') {
			const serverQueue = globalqueue.get(interaction.guildId);
			if (!serverQueue) {
				return interaction.reply({ content: 'There is nothing playing!', ephemeral: true });
			}
			let queue = '';
			for (let i = 0; i < serverQueue.songs.length; i++) {
				queue += `${i + 1}. ${serverQueue.songs[i].title}\n`;
			}
			return interaction.reply({ content: queue, ephemeral: false });
		} else if (subcommand === 'pause') {
			const serverQueue = globalqueue.get(interaction.guildId);
			if (!serverQueue) {
				return interaction.reply({ content: 'There is nothing playing!', ephemeral: true });
			}
			serverQueue.connection.pause();
			return interaction.reply({ content: 'The music has been paused!', ephemeral: false });
		} else if (subcommand === 'resume') {
			const serverQueue = globalqueue.get(interaction.guildId);
			if (!serverQueue) {
				return interaction.reply({ content: 'There is nothing playing!', ephemeral: true });
			}
			serverQueue.connection.unpause();
			return interaction.reply({ content: 'The music has been resumed!', ephemeral: false });
		} else if (subcommand === 'loop') {
			const serverQueue = globalqueue.get(interaction.guildId);
			if (!serverQueue) {
				return interaction.reply({ content: 'There is nothing playing!', ephemeral: true });
			}
			serverQueue.loop = !serverQueue.loop;
			return interaction.reply({ content: `Loop is now ${serverQueue.loop ? 'on' : 'off'}`, ephemeral: false });
		} else if (subcommand === 'shuffle') {
			const serverQueue = globalqueue.get(interaction.guildId);
			if (!serverQueue) {
				return interaction.reply({ content: 'There is nothing playing!', ephemeral: true });
			}
			serverQueue.shuffle = !serverQueue.shuffle;
			return interaction.reply({ content: `Shuffle is now ${serverQueue.shuffle ? 'on' : 'off'}`, ephemeral: false });
		} else if (subcommand === 'remove') {
			const serverQueue = globalqueue.get(interaction.guildId);
			if (!serverQueue) {
				return interaction.reply({ content: 'There is nothing playing!', ephemeral: true });
			}
			const position = interaction.options.getInteger('position');
			if (position > serverQueue.songs.length) {
				return interaction.reply({ content: 'There is no song at that position!', ephemeral: true });
			}
			serverQueue.songs.splice(position - 1, 1);
			return interaction.reply({ content: `Song at position ${position} has been removed!`, ephemeral: false });
		} else if (subcommand === 'nowplaying') {
			const serverQueue = globalqueue.get(interaction.guildId);
			if (!serverQueue) {
				return interaction.reply({ content: 'There is nothing playing!', ephemeral: true });
			}
			return interaction.reply({ content: `Now playing: ${serverQueue.songs[0].title}`, ephemeral: false });
		} else if (subcommand === 'volume') {
			const serverQueue = globalqueue.get(interaction.guildId);
			if (!serverQueue) {
				return interaction.reply({ content: 'There is nothing playing!', ephemeral: true });
			}
			const volume = interaction.options.getInteger('volume');
			serverQueue.volume = volume;
			serverQueue.connection.setVolumeLogarithmic(volume / 100);
			return interaction.reply({ content: `Volume has been set to ${volume}`, ephemeral: false });
		} else if (subcommand === 'search') {
			const songName = interaction.options.getString('song name');
			await searchSong(songName, interaction);
		} else if (subcommand === 'seek') {
			const serverQueue = globalqueue.get(interaction.guildId);
			if (!serverQueue) {
				return interaction.reply({ content: 'There is nothing playing!', ephemeral: true });
			}
			const time = interaction.options.getString('time');
			const timeArray = time.split(':');
			let seconds = 0;
			if (timeArray.length === 3) {
				seconds += parseInt(timeArray[0]) * 3600;
				seconds += parseInt(timeArray[1]) * 60;
				seconds += parseInt(timeArray[2]);
			} else if (timeArray.length === 2) {
				seconds += parseInt(timeArray[0]) * 60;
				seconds += parseInt(timeArray[1]);
			} else if (timeArray.length === 1) {
				seconds += parseInt(timeArray[0]);
			}
			serverQueue.connection.seek(seconds * 1000);
			return interaction.reply({ content: `Seeked to ${time}`, ephemeral: false });
		}
	},
};

async function addSongToQueue(link, interaction) {
	const serverQueue = globalqueue.get(interaction.guildId);
	const songInfo = await ytdl.getInfo(link);
	const song = {
		title: songInfo.videoDetails.title,
		url: songInfo.videoDetails.video_url,
	};
	if (!serverQueue) {
		const queueConstruct = {
			textChannel: interaction.channel,
			voiceChannel: interaction.member.voice.channel,
			connection: null,
			songs: [],
			volume: 100,
			playing: true,
			loop: false,
			shuffle: false,
		};
		globalqueue.set(interaction.guildId, queueConstruct);
		queueConstruct.songs.push(song);
		try {
			const connection = joinVoiceChannel({
				channelId: interaction.member.voice.channel.id,
				guildId: interaction.guildId,
				adapterCreator: interaction.guild.voiceAdapterCreator,
			});
			queueConstruct.connection = connection;
			await entersState(connection, VoiceConnectionStatus.Ready, 30e3);
			await interaction.reply({ content: `${song.title} has been added to the queue!`, ephemeral: false });
			play(interaction.guild, queueConstruct.songs[0]);
		} catch (err) {
			console.log(err);
			globalqueue.delete(interaction.guildId);
			return interaction.reply({ content: 'There was an error connecting!', ephemeral: true });
		}
	} else {
		serverQueue.songs.push(song);
		return interaction.reply({ content: `${song.title} has been added to the queue!`, ephemeral: false });
	}
}

async function play(guild, song) {
	const serverQueue = globalqueue.get(guild.id);
	if (!song) {
		serverQueue.voiceChannel.leave();
		globalqueue.delete(guild.id);
		return;
	}
	const audioPlayer = createAudioPlayer();
	const audioResource = createAudioResource(ytdl(song.url, { filter: 'audioonly', highWaterMark: 1 << 25 }), { inputType: StreamType.Arbitrary });
	audioPlayer.play(audioResource);
	audioPlayer.on(AudioPlayerStatus.Idle, () => {
		if (serverQueue.loop) {
			play(guild, serverQueue.songs[0]);
		} else if (serverQueue.shuffle) {
			serverQueue.songs.push(serverQueue.songs.shift());
			play(guild, serverQueue.songs[0]);
		} else {
			serverQueue.songs.shift();
			play(guild, serverQueue.songs[0]);
		}
	});
	audioPlayer.on('error', error => {
		console.error(error);
	});
	serverQueue.connection.subscribe(audioPlayer);
}

async function searchSong(songName, interaction) {
	const searchResults = await ytsr(songName, { limit: 5 });
	const searchEmbed = new EmbedBuilder()
		.setTitle('Search Results')
		.setColor('#ff0000')
		.setDescription('Choose a song to play');
	for (let i = 0; i < searchResults.items.length; i++) {
		searchEmbed.addField(`${i + 1}. ${searchResults.items[i].title}`, searchResults.items[i].url);
	}
	const searchMessage = await interaction.reply({ embeds: [searchEmbed], fetchReply: true });
	const filter = m => m.author.id === interaction.user.id;
	const collector = searchMessage.channel.createMessageCollector({ filter, time: 15000 });
	collector.on('collect', async m => {
		if (m.content > 0 && m.content <= searchResults.items.length) {
			collector.stop();
			await interaction.editReply({ content: 'Searching...', embeds: [] });
			addSongToQueue(searchResults.items[m.content - 1].url, interaction);
		} else {
			await interaction.editReply({ content: 'Invalid number!', embeds: [] });
		}
	});
	collector.on('end', collected => {
		if (collected.size === 0) {
			interaction.editReply({ content: 'Timed out!', embeds: [] });
		}
	});
}