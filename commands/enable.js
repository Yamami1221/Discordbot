const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');

const { globaldata } = require('../data/global');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('enable')
        .setDescription('enable text channel for music commands')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .setDMPermission(false),
    async execute(interaction) {
        await interaction.deferReply();
        const serverData = globaldata.get(interaction.guildId) ?? undefined;
        if (serverData?.veriChannel) {
            if (interaction.channel.id === serverData.veriChannel.id) {
                const embed = new EmbedBuilder()
                    .setTitle('Verification')
                    .setDescription('You cannot use this command in the verification channel');
                await interaction.editReply({ embeds: [embed], ephemeral: true });
                return;
            }
        }
        if (interaction.member.permissions.has('MANAGE_CHANNELS')) {
            const serverdata = globaldata?.get(interaction.guild.id);
            if (!serverdata) {
                const queueconstruct = {
                    textchannel: [],
                    voicechannel: null,
                    connection: null,
                    songs: [],
                    volume: 50,
                    player: null,
                    resource: null,
                    playing: false,
                    loop: false,
                    shuffle: false,
                    autoplay: false,
                    sound8d: false,
                    bassboost: false,
                    nightcore: false,
                    veriRole: null,
                    veriChannel: null,
                    chatbotChannel: [],
                    timervar: null,
                };
                queueconstruct.textchannel.push(interaction.channel);
                globaldata.set(interaction.guild.id, queueconstruct);
                let embed = new EmbedBuilder()
                    .setTitle('Enable')
                    .setDescription(`Enabled ${interaction.guild.name} for music commands`);
                await interaction.editReply({ embeds: [embed] });
                embed = new EmbedBuilder()
                    .setTitle('Enable')
                    .setDescription(`Added <#${interaction.channel.id}> for music commands enabled list`);
                await interaction.followUp({ embeds: [embed] });
                const mapToWrite = new Map(globaldata);
                mapToWrite.forEach((value) => {
                    value.songs = [];
                    value.connection = null;
                    value.player = null;
                    value.resource = null;
                });
                const objToWrite = Object.fromEntries(mapToWrite);
                const jsonToWrite = JSON.stringify(objToWrite);
                fs.writeFile('./data/data.json', jsonToWrite, err => {
                    if (err) {
                        console.log('There has been an error saving your configuration data.');
                        console.log(err.message);
                        const errembed = new EmbedBuilder()
                            .setTitle('Enable')
                            .setDescription('There has been an error saving your configuration data.');
                        interaction.editReply({ embeds: [errembed] });
                        return;
                    }
                });
            } else {
                const enabled = serverdata.textchannel.find((channel) => channel.id === interaction.channel.id);
                if (!enabled) {
                    serverdata.textchannel.push(interaction.channel);
                    const textchannelforshowloc = serverdata.textchannel.indexOf(interaction.channel);
                    const textchannelforshow = serverdata.textchannel[textchannelforshowloc].id;
                    const embed = new EmbedBuilder()
                        .setTitle('Enable')
                        .setDescription(`Added <#${textchannelforshow}> for music commands enabled list`);
                    await interaction.editReply({ embeds: [embed] });
                    const mapToWrite = new Map(globaldata);
                    mapToWrite.forEach((value) => {
                        value.songs = [];
                        value.connection = null;
                        value.player = null;
                        value.resource = null;
                    });
                    const objToWrite = Object.fromEntries(mapToWrite);
                    const jsonToWrite = JSON.stringify(objToWrite);
                    fs.writeFile('./data/data.json', jsonToWrite, err => {
                        if (err) {
                            console.log('There has been an error saving your configuration data.');
                            console.log(err.message);
                            const errembed = new EmbedBuilder()
                                .setTitle('Enable')
                                .setDescription('There has been an error saving your configuration data.');
                            interaction.editReply({ embeds: [errembed] });
                            return;
                        }
                    });
                } else {
                    const embed = new EmbedBuilder()
                        .setTitle('Enable')
                        .setDescription('This channel is already enabled for music commands');
                    await interaction.editReply({ embeds: [embed] });
                }
            }
        } else {
            const embed = new EmbedBuilder()
                .setTitle('Enable')
                .setDescription('You do not have permission to use this command');
            await interaction.editReply({ embeds: [embed], ephemeral: true });
        }
    },
};