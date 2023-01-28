const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, StreamType, NoSubscriberBehavior } = require('@discordjs/voice');
const { yt_validate, video_basic_info, stream } = require('play-dl');
const ytdl = require('ytdl-core');
const ytsr = require('ytsr');
const fs = require('fs');

const { globaldata } = require('../data/global');

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
    if (yt_validate(url) === 'video') {
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
    await interaction.deferReply();
    const serverData = globaldata.get(interaction.guildId) || undefined;
    if (serverData?.veriChannel) {
        if (interaction.channel.id === serverData.veriChannel.id) {
            const embed = new EmbedBuilder()
                .setTitle('Verification')
                .setDescription('You cannot use this command in the verification channel');
            await interaction.editReply({ embeds: [embed], ephemeral: true });
            return;
        }
    }
    let link = interaction.options.getString('query');
    if (!await isValidYoutubeUrl(link) && !await isValidURL(link)) {
        link = await search(interaction);
        if (!link) {
            const embed = new EmbedBuilder()
                .setTitle('Play')
                .setDescription('No results found!');
            return interaction.editReply({ embeds: [embed], ephemeral: true });
        }
    }
    const voicechannel = interaction.member.voice.channel;
    let embed = new EmbedBuilder()
        .setTitle('Play')
        .setDescription('You need to be in a voice channel to use this command!');
    if (!voicechannel) return interaction.editReply({ embeds: [embed] });
    const permissions = voicechannel.permissionsFor(interaction.client.user);
    if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
        const permissionsembed = new EmbedBuilder()
            .setTitle('Play')
            .setDescription('I need the permissions to join and speak in your voice channel!');
        return interaction.editReply({ embeds: [permissionsembed] });
    }
    const serverdata = globaldata.get(interaction.guild.id);
    embed = new EmbedBuilder()
        .setTitle('Play')
        .setDescription('This server is not enabled for music commands!');
    if (!serverdata) return interaction.editReply({ embeds: [embed] });
    let enabled = false;
    for (let i = 0; i < serverdata.textchannel.length; i++) {
        if (serverdata.textchannel[i].id === interaction.channel.id) {
            enabled = true;
            break;
        }
    }
    embed = new EmbedBuilder()
        .setTitle('Play')
        .setDescription('this channel is not enabled for music commands!');
    if (!enabled) return interaction.editReply({ embeds: [embed] });
    const songinfo1 = await video_basic_info(link);
    const songinfo2 = await ytdl.getBasicInfo(link);
    const song = {
        title: songinfo1.video_details.title,
        url: songinfo2.videoDetails.video_url,
    };
    if (!serverdata.songs[0]) {
        serverdata.songs.push(song);
        embed = new EmbedBuilder()
            .setTitle('Play')
            .setDescription(`**${song.title}** has been added to the queue!`);
        interaction.editReply({ embeds: [embed] });
        try {
            const connection = joinVoiceChannel({
                channelId: voicechannel.id,
                guildId: voicechannel.guild.id,
                adapterCreator: voicechannel.guild.voiceAdapterCreator,
            });
            serverdata.connection = connection;
            await playSong(interaction, serverdata.songs[0]);
        } catch (error) {
            console.error(error);
            serverdata.song = [];
            const errorembed = new EmbedBuilder()
                .setTitle('Play')
                .setDescription(`There was an error: ${error}`);
            return interaction.editReply({ embeds: [errorembed] });
        }
    } else {
        serverdata.songs.push(song);
        embed = new EmbedBuilder()
            .setTitle('Play')
            .setDescription(`**${song.title}** has been added to the queue!`);
        interaction.editReply({ embeds: [embed] });
    }
}

async function playSong(interaction, song) {
    const serverdata = globaldata.get(interaction.guild.id);
    serverdata.playing = true;
    if (!song) {
        // await serverdata.connection.destroy();
        // serverdata.connection = null;
        serverdata.resource = null;
        serverdata.player = null;
        serverdata.playing = false;
        const settimeoutObj = setTimeout(() => {
            serverdata.connection.destroy();
            serverdata.connection = null;
            serverdata.resource = null;
            serverdata.player = null;
            serverdata.playing = false;
            const datatowrite = JSON.stringify(globaldata, replacer);
            fs.writeFileSync('./data/data.json', datatowrite, err => {
                if (err) {
                    console.log('There has been an error saving your configuration data.');
                    console.log(err.message);
                    const errorembed = new EmbedBuilder()
                        .setTitle('Play')
                        .setDescription('There has been an error saving your configuration data.');
                    interaction.editReply({ embeds: [errorembed] });
                    return;
                }
            });
        }, 30000);
        serverdata.player.on(AudioPlayerStatus.Playing, () => {
            clearTimeout(settimeoutObj);
        });
        // const datatowrite = JSON.stringify(globaldata, replacer);
        // fs.writeFile('./data.json', datatowrite, err => {
        //     if (err) {
        //         console.log('There has been an error saving your configuration data.');
        //         console.log(err.message);
        //         const embed = new EmbedBuilder()
        //             .setTitle('Enable')
        //             .setDescription('There has been an error saving your configuration data.');
        //         interaction.editReply({ embeds: [embed] });
        //         return;
        //     }
        // });
        return;
    }
    const songstream = await stream(song.url, { discordPlayerCompatibility : true });
    serverdata.resource = createAudioResource(songstream.stream, { inputType: StreamType.Arbitrary, inlineVolume: true });
    serverdata.resource.volume.setVolume(serverdata.volume / 100);
    serverdata.player = createAudioPlayer({
        behaviors: {
            noSubscriber: NoSubscriberBehavior.Pause,
        },
    });
    serverdata.player.play(serverdata.resource);
    serverdata.connection.subscribe(serverdata.player);
    serverdata.player.on(AudioPlayerStatus.Idle, () => {
        if (serverdata.loop) {
            playSong(interaction, serverdata.songs[0]);
        } else {
            serverdata.songs.shift();
            playSong(interaction, serverdata.songs[0]);
        }
    });
    serverdata.player.on(AudioPlayerStatus.AutoPaused, () => {
        const settimeoutObj = setTimeout(() => {
            serverdata.connection.destroy();
            serverdata.connection = null;
            serverdata.resource = null;
            serverdata.player = null;
            serverdata.playing = false;
            const datatowrite = JSON.stringify(globaldata, replacer);
            fs.writeFileSync('./data/data.json', datatowrite, err => {
                if (err) {
                    console.log('There has been an error saving your configuration data.');
                    console.log(err.message);
                    const errorembed = new EmbedBuilder()
                        .setTitle('Play')
                        .setDescription('There has been an error saving your configuration data.');
                    interaction.editReply({ embeds: [errorembed] });
                    return;
                }
            });
        }, 30000);
        serverdata.player.on(AudioPlayerStatus.Playing, () => {
            clearTimeout(settimeoutObj);
        });
    });
    const embed = new EmbedBuilder()
        .setTitle('Play')
        .setDescription(`Now playing **${song.title}**`);
    await interaction.channel.send({ embeds: [embed] });
}

async function search(interaction) {
    const songname = interaction.options.getString('query');
    const song = await ytsr(songname, { limit: 1 });
    if (!song.items[0]) return false;
    const songurl = song.items[0].url;
    return songurl;
}

function replacer(key, value) {
    if (value instanceof Map) {
        return {
            dataType: 'Map',
            value: Array.from(value.entries()), // or with spread: value: [...value]
        };
    } else {
        return value;
    }
}