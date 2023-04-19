const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');

const { globaldata, datapath, role66map, roles66path } = require('../data/global');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('eng-veri-clear')
        .setDescription('Clear the verification system')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(interaction) {
        const serverData = globaldata.get(interaction.guildId) || undefined;
        if (serverData?.veriChannel) {
            if (interaction.channel.id === serverData.veriChannel.id) {
                const embed = new EmbedBuilder()
                    .setTitle('Verification')
                    .setDescription('You cannot use this command in the verification channel');
                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }
        }
        if (!serverData) {
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
            globaldata.set(interaction.guild.id, queueconstruct);
        }
        const serverdata = globaldata.get(interaction.guildId);
        const alreadySetup = role66map.get(interaction.guildId);
        if (serverdata.veriChannel && alreadySetup) {
            serverdata.veriChannel = null;
            serverdata.veriRole = null;
            role66map.delete(interaction.guildId);
            fs.writeFileSync(roles66path, JSON.stringify([...role66map]));
            const embed = new EmbedBuilder()
                .setTitle('Verification')
                .setDescription('Verification system cleared');
            await interaction.reply({ embeds: [embed] });
        } else {
            const embed = new EmbedBuilder()
                .setTitle('Verification')
                .setDescription('Verification system is not setup');
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
        const premapToWrite = new Map([...globaldata]);
        const mapToWrite = new Map([...premapToWrite].map(([key, value]) => [key, Object.assign({}, value)]));
        mapToWrite.forEach((value) => {
            value.songs = [];
            value.connection = null;
            value.player = null;
            value.resource = null;
            value.timervar = null;
        });
        const objToWrite = Object.fromEntries(mapToWrite);
        const jsonToWrite = JSON.stringify(objToWrite, null, 4);
        fs.writeFile(datapath, jsonToWrite, err => {
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
        const premapToWrite2 = new Map([...role66map]);
        const mapToWrite2 = new Map([...premapToWrite2].map(([key, value]) => [key, Object.assign({}, value)]));
        const objToWrite2 = Object.fromEntries(mapToWrite2);
        const jsonToWrite2 = JSON.stringify(objToWrite2, null, 4);
        fs.writeFileSync(roles66path, jsonToWrite2, err => {
            if (err) {
                console.log('There has been an error saving your configuration data.');
                console.log(err.message);
                const errembed = new EmbedBuilder()
                    .setTitle('Enable')
                    .setDescription('There has been an error saving your configuration data.');
                return interaction.editReply({ embeds: [errembed] });
            }
        });
    },
};