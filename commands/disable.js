const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');

const { globaldata } = require('../data/global');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('disable')
        .setDescription('disable text channel for music commands')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .setDMPermission(false),
    async execute(interaction) {
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
        if (interaction.member.permissions.has('MANAGE_CHANNELS')) {
            const serverdata = globaldata?.get(interaction.guild.id);
            if (!serverdata) {
                const embed = new EmbedBuilder()
                    .setTitle('Disable')
                    .setDescription(`${interaction.guild.name} in not enabled for music commands`);
                await interaction.editReply({ embeds: [embed], ephemeral: true });
                return;
            } else {
                const enabled = serverdata.textchannel.find((channel) => channel.id === interaction.channel.id);
                if (enabled) {
                    for (let i = 0; i < serverdata.textchannel.length; i++) {
                        if (serverdata.textchannel[i].id === interaction.channel.id) {
                            serverdata.textchannel.splice(i, 1);
                            break;
                        }
                    }
                    const embed = new EmbedBuilder()
                        .setTitle('Disable')
                        .setDescription(`Disabled <#${interaction.channel.id}> for music commands`);
                    await interaction.editReply({ embeds: [embed] });
                    const premapToWrite = new Map([...globaldata]);
                    const mapToWrite = new Map([...premapToWrite].map(([key, value]) => [key, Object.assign({}, value)]));
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
                        .setTitle('Disable')
                        .setDescription(`<#${interaction.channel.id}> is already disabled`);
                    await interaction.editReply({ embeds: [embed], ephemeral: true });
                    return;
                }
            }
        } else {
            const embed = new EmbedBuilder()
                .setTitle('Disable')
                .setDescription('You do not have permission to use this command');
            await interaction.editReply({ embeds: [embed], ephemeral: true });
        }
    },
};