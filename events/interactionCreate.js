const { Events } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, entersState } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const ytsr = require('ytsr');

var globalqueue = new Map();

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (interaction.isChatInputCommand()) {
			const command = interaction.client.commands.get(interaction.commandName);

			if (!command) {
				interaction.reply({ content: `No command matching ${interaction.commandName} was found.` , ephemeral: true });
				console.error(`No command matching ${interaction.commandName} was found.`);
				return;
			}

			try {
				await command.execute(interaction);
			} catch (error) {
				interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
				console.error(`Error executing ${interaction.commandName}`);
				console.error(error);
			}

			if (command === 'play') {
				interaction.deferReply();
				const serverQueue = globalqueue.get(interaction.guild.id);
				const voiceChannel = interaction.member.voice.channel;
				if (!voiceChannel) return interaction.reply('You need to be in a voice channel to play music!');
				const permissions = voiceChannel.permissionsFor(interaction.client.user);
				if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
					return interaction.reply('I need the permissions to join and speak in your voice channel!');
				}

				const link = interaction.options.getString('link');

				if (!isValidYoutubeUrl(link)) {
					const filter = await ytsr.getFilters(link);
					const options = filter.get('Type').find(o => o.name === 'Video');
					const search = await ytsr(options.url, { limit: 1 });
					const link = search.items[0].url;
				}

				const songInfo = await ytdl.getInfo(link);
				const song = {
					title: songInfo.videoDetails.title,
					url: songInfo.videoDetails.video_url,
				};

				if (!serverQueue) {
					const queueConstruct = {
						textChannel: interaction.channel,
						voiceChannel: voiceChannel,
						connection: null,
						songs: [],
						volume: 5,
						playing: true,
					};

					globalqueue.set(interaction.guild.id, queueConstruct);

					queueConstruct.songs.push(song);

					try {
						var connection = await voiceChannel.join();
						queueConstruct.connection = connection;
						play(interaction.guild, queueConstruct.songs[0]);
					} catch (err) {
						console.log(err);
						globalqueue.delete(interaction.guild.id);
						return interaction.reply(err);
					}
				} else {
					serverQueue.songs.push(song);
					return interaction.reply(`${song.title} has been added to the queue!`);
				}
			} else if (command === 'skip') {
				const serverQueue = globalqueue.get(interaction.guild.id);
				if (!interaction.member.voice.channel) return interaction.reply('You have to be in a voice channel to stop the music!');
				if (!serverQueue) return interaction.reply('There is no song that I could skip!');
				serverQueue.connection.destroy();
			} else if (command === 'stop') {
				const serverQueue = globalqueue.get(interaction.guild.id);
				if (!interaction.member.voice.channel) return interaction.reply('You have to be in a voice channel to stop the music!');
				serverQueue.songs = [];
				serverQueue.connection.destroy();
			} else if (command === 'queue') {
				const serverQueue = globalqueue.get(interaction.guild.id);
				if (!serverQueue) return interaction.reply('There is no queue!');
				var queue = '';
				for (var i = 0; i < serverQueue.songs.length; i++) {
					queue += `${serverQueue.songs[i].title}\n`;
				}
				interaction.reply(queue);
			} else if (command === 'pause') {
				const serverQueue = globalqueue.get(interaction.guild.id);
				if (!interaction.member.voice.channel) return interaction.reply('You have to be in a voice channel to pause the music!');
				if (!serverQueue) return interaction.reply('There is no song that I could pause!');
				serverQueue.connection.dispatcher.pause();
			} else if (command === 'resume') {
				const serverQueue = globalqueue.get(interaction.guild.id);
				if (!interaction.member.voice.channel) return interaction.reply('You have to be in a voice channel to resume the music!');
				if (!serverQueue) return interaction.reply('There is no song that I could resume!');
				serverQueue.connection.dispatcher.resume();
			} else if (command === 'volume') {
				const serverQueue = globalqueue.get(interaction.guild.id);
				if (!interaction.member.voice.channel) return interaction.reply('You have to be in a voice channel to change the volume!');
				if (!serverQueue) return interaction.reply('There is no song that I could change the volume!');
				const volume = interaction.options.getInteger('volume');
				serverQueue.volume = volume;
				serverQueue.connection.dispatcher.setVolumeLogarithmic(volume / 5);
				return interaction.reply(`I set the volume to: ${volume}`);
			} else if (command === 'np' || command === 'nowplaying') {
				const serverQueue = globalqueue.get(interaction.guild.id);
				if (!serverQueue) return interaction.reply('There is no song playing!');
				return interaction.reply(`Now playing: ${serverQueue.songs[0].title}`);
			} else if (command === 'loop') {
				const serverQueue = globalqueue.get(interaction.guild.id);
				if (!interaction.member.voice.channel) return interaction.reply('You have to be in a voice channel to loop the music!');
				if (!serverQueue) return interaction.reply('There is no song that I could loop!');
				serverQueue.loop = !serverQueue.loop;
				return interaction.reply(`Loop is now ${serverQueue.loop ? '**on**' : '**off**'}`);
			} else if (command === 'shuffle') {
				const serverQueue = globalqueue.get(interaction.guild.id);
				if (!interaction.member.voice.channel) return interaction.reply('You have to be in a voice channel to shuffle the music!');
				if (!serverQueue) return interaction.reply('There is no song that I could shuffle!');
				serverQueue.songs = shuffle(serverQueue.songs);
				return interaction.reply('Shuffled the queue!');
			} else if (command === 'remove') {
				const serverQueue = globalqueue.get(interaction.guild.id);
				if (!interaction.member.voice.channel) return interaction.reply('You have to be in a voice channel to remove the music!');
				if (!serverQueue) return interaction.reply('There is no song that I could remove!');
				const index = interaction.options.getInteger('index');
				if (index > serverQueue.songs.length) return interaction.reply('There is no song at that index!');
				serverQueue.songs.splice(index, 1);
				return interaction.reply('Removed the song!');
			} else if (command === 'search') {
				const serverQueue = globalqueue.get(interaction.guild.id);
				const query = interaction.options.getString('query');
				const res = await ytsr(query, { limit: 1 });
				const video = res.items[0];
				const song = {
					title: video.title,
					url: video.url,
				};
				if (!serverQueue) {
					const queueConstruct = {
						textChannel: interaction.channel,
						voiceChannel: interaction.member.voice.channel,
						connection: null,
						songs: [],
						volume: 5,
						playing: true,
						loop: false,
					};
					globalqueue.set(interaction.guild.id, queueConstruct);
					queueConstruct.songs.push(song);
					try {
						const connection = await interaction.member.voice.channel.join();
						queueConstruct.connection = connection;
						play(interaction.guild, queueConstruct.songs[0]);
					} catch (err) {
						console.log(err);
						globalqueue.delete(interaction.guild.id);
						return interaction.reply(err);
					}
				} else {
					serverQueue.songs.push(song);
					return interaction.reply(`${song.title} has been added to the queue!`);
				}
			}

		} else if (interaction.isAutocomplete()) {
			const command = interaction.client.commands.get(interaction.commandName);

			if (!command) {
				console.error(`No command matching ${interaction.commandName} was found.`);
				return;
			}

			try {
				await command.autocomplete(interaction);
			} catch (error) {
				console.error(error);
			}
		} else if (interaction.isButton()) {
			return;
		} else if (!interaction.isCommand()) {
			return;
		}

		
	},
};

async function play(guild, song) {
	const serverQueue = globalqueue.get(guild.id);

	if (!song) {
		serverQueue.voiceChannel.leave();
		globalqueue.delete(guild.id);
		return;
	}

	const connection = joinVoiceChannel({
		channelId: serverQueue.voiceChannel.id,
		guildId: guild.id,
		adapterCreator: guild.voiceAdapterCreator,
	});

	serverQueue.connection = connection;

	const player = createAudioPlayer();
	const resource = createAudioResource(ytdl(song.url, { filter: 'audioonly' }));
	player.play(resource);
	serverQueue.connection.subscribe(player);

	player.on(AudioPlayerStatus.Idle, () => {
		serverQueue.songs.shift();
		play(guild, serverQueue.songs[0]);
	});

	await entersState(player, AudioPlayerStatus.Playing, 5e3);
}

function shuffle(array) {
	let currentIndex = array.length, temporaryValue, randomIndex;

	while (currentIndex !== 0) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
}

async function isValidYoutubeUrl(url) {
	if (url.includes('youtube.com') || url.includes('youtu.be')) {
		return true;
	} else {
		return false;
	}
}