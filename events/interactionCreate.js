const { Events, EmbedBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, StreamType } = require('@discordjs/voice');
const { stream, video_basic_info, yt_validate } = require('play-dl');
const ytdl = require('ytdl-core');
const ytsr = require('ytsr');

const { globalqueue, globalresource } = require('../global.js');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (interaction.isChatInputCommand()) {
			const command = interaction.client.commands.get(interaction.commandName);

			if (!command) {
				interaction.reply({ content: `No command matching ${interaction.commandName} was found.`, ephemeral: true });
				console.error(`No command matching ${interaction.commandName} was found.`);
				return;
			}

			if (command === 'play') {
				console.log('play');
				// playtest(interaction);
				play(interaction);
			} else if (command === 'pause') {
				pause(interaction);
			} else if (command === 'resume') {
				resume(interaction);
			} else if (command === 'seek') {
				seek(interaction);
			} else if (command === 'jump') {
				jump(interaction);
			} else if (command === 'skip') {
				skip(interaction);
			} else if (command === 'stop') {
				stop(interaction);
			} else if (command === 'remove') {
				remove(interaction);
			} else if (command === 'loop') {
				loop(interaction);
			} else if (command === 'shuffle') {
				shuffle(interaction);
			} else if (command === 'queue') {
				queue(interaction);
			} else if (command === 'nowplaying' || command === 'np') {
				console.log('np');
				interaction.deferReply();
				nowplaying(interaction);
			} else if (command === 'lyrics') {
				lyrics(interaction);
			} else if (command === 'volume') {
				volume(interaction);
			} else {
				try {
					await command.execute(interaction);
				} catch (error) {
					interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
					console.error(`Error executing ${interaction.commandName}`);
					console.error(error);
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

async function pause(interaction) {
	await interaction.deferReply();
	const serverqueue = globalqueue.get(interaction.guild.id);
	const useresource = globalresource.get(interaction.guild.id);
	if (!serverqueue) return interaction.editReply({ content: 'There is no song that I could pause!', ephemeral: true });
	useresource.pause();
	await interaction.editReply({ content: 'Paused the music!' });
}

async function resume(interaction) {
	await interaction.deferReply();
	const serverqueue = globalqueue.get(interaction.guild.id);
	const useresource = globalresource.get(interaction.guild.id);
	if (!serverqueue) return interaction.editReply({ content: 'There is no song that I could resume!', ephemeral: true });
	useresource.unpause();
	await interaction.editReply({ content: 'Resumed the music!' });
}

async function seek(interaction) {
	await interaction.deferReply();
	const serverqueue = globalqueue.get(interaction.guild.id);
	if (!serverqueue) return interaction.editReply({ content: 'There is no song that I could seek!', ephemeral: true });
	const seektime = interaction.options.getInteger('time');
	if (seektime > serverqueue.songs[0].duration) return interaction.editReply({ content: 'You cannot seek past the end of the song!', ephemeral: true });
	serverqueue.connection.seek(seektime * 1000);
	await interaction.editReply({ content: `Seeked to ${seektime} seconds!` });
}

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

async function skip(interaction) {
	await interaction.deferReply();
	const serverqueue = globalqueue.get(interaction.guild.id);
	if (!serverqueue) return interaction.editReply({ content: 'There is no song that I could skip!', ephemeral: true });
	serverqueue.connection.destroy();
	await interaction.editReply({ content: 'Skipped the song!' });
}

async function stop(interaction) {
	await interaction.deferReply();
	const serverqueue = globalqueue.get(interaction.guild.id);
	const useresource = globalresource.get(interaction.guild.id);
	if (!serverqueue) return interaction.editReply({ content: 'There is no song that I could stop!', ephemeral: true });
	serverqueue.songs = [];
	serverqueue.connection.destroy();
	useresource.stop();
	await interaction.editReply({ content: 'Stopped the music!' });
}

async function remove(interaction) {
	await interaction.deferReply();
	const serverqueue = globalqueue.get(interaction.guild.id);
	if (!serverqueue) return interaction.editReply({ content: 'There is no song that I could remove!', ephemeral: true });
	const index = interaction.options.getInteger('position');
	if (index > serverqueue.songs.length) return interaction.editReply({ content: 'There is no song at that index!', ephemeral: true });
	serverqueue.songs.splice(index - 1, 1);
	await interaction.editReply({ content: `Removed the song at index ${index}!` });
}

async function loop(interaction) {
	await interaction.deferReply();
	const serverqueue = globalqueue.get(interaction.guild.id);
	if (!serverqueue) return interaction.editReply({ content: 'There is no song that I could loop!', ephemeral: true });
	serverqueue.connection.loop(true);
	await interaction.editReply({ content: 'Looped the music!' });
}

async function shuffle(interaction) {
	await interaction.deferReply();
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

async function queue(interaction) {
	await interaction.deferReply();
	const serverqueue = globalqueue.get(interaction.guild.id);
	if (!serverqueue) return interaction.editReply({ content: 'There is no song in the queue!', ephemeral: true });
	const queueembed = new EmbedBuilder()
		.setTitle('Server Queue')
		.setDescription(serverqueue.songs.map(song => `**-** ${song.title}`).join('\n'))
		.setColor('#ff8400');
	await interaction.editReply({ embeds: [queueembed] });
}

async function nowplaying(interaction) {
	await interaction.deferReply();
	const serverqueue = globalqueue.get(interaction.guild.id);
	if (!serverqueue) return interaction.editReply({ content: 'There is no song that I could show!', ephemeral: true });
	const songembed = new EmbedBuilder()
		.setTitle('Now Playing')
		.setDescription(`**${serverqueue.songs[0].title}**`)
		.setColor('#ff8400');
	await interaction.editReply({ embeds: [songembed] });
}

async function lyrics(interaction) {
	await interaction.deferReply();
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

async function volume(interaction) {
	await interaction.deferReply();
	const serverqueue = globalqueue.get(interaction.guild.id);
	if (!serverqueue) return interaction.editReply({ content: 'There is no song that I could change the volume of!', ephemeral: true });
	const useresource = globalresource.get(interaction.guild.id);
	const volumes = interaction.options.getInteger('volume');
	if (volumes > 200 || volumes < 0) return interaction.editReply({ content: 'The volume must be between 0 and 200!', ephemeral: true });
	serverqueue.volume = volumes;
	await useresource.volume.setVolume(serverqueue.volume / 100);
	await interaction.editReply({ content: `Set the volume to ${volumes}!` });
}