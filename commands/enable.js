const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');

const { globalqueue } = require('../global.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('enable')
        .setDescription('enable text channel for music commands')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .setDMPermission(false),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: false });
        if (interaction.member.permissions.has('MANAGE_CHANNELS')) {
            const serverqueue = globalqueue?.get(interaction.guild.id);
            if (!serverqueue) {
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
                };
                queueconstruct.textchannel.push(interaction.channel);
                globalqueue.set(interaction.guild.id, queueconstruct);
                await interaction.editReply({ content: `Enabled ${interaction.guild.name} for music commands` });
                await interaction.followUp({ content: `Added <#${interaction.channel.id}> for music commands enabled list` });
                const data = JSON.stringify(globalqueue, replacer);
                fs.writeFile('./data.json', data, err => {
                    if (err) {
                        console.log('There has been an error saving your configuration data.');
                        console.log(err.message);
                        interaction.followUp({ content: 'There has been an error saving your configuration data.' });
                        return;
                    }
                });
            } else {
                let enabled = false;
                for (let i = 0; i < serverqueue.textchannel.length; i++) {
                    if (serverqueue.textchannel[i].id === interaction.channel.id) {
                        await interaction.editReply({ content: `<#${interaction.channel.id}> is already enabled` });
                        enabled = true;
                        return;
                    }
                }
                if (enabled === false) {
                    serverqueue.textchannel.push(interaction.channel);
                    const textchannelforshowloc = serverqueue.textchannel.indexOf(interaction.channel);
                    const textchannelforshow = serverqueue.textchannel[textchannelforshowloc].id;
                    await interaction.editReply({ content: `Added <#${textchannelforshow}> for music commands enabled list` });
                    const data = JSON.stringify(globalqueue, replacer);
                    fs.writeFile('./data.json', data, err => {
                        if (err) {
                            console.log('There has been an error saving your configuration data.');
                            console.log(err.message);
                            interaction.followUp({ content: 'There has been an error saving your configuration data.' });
                            return;
                        }
                    });
                }
            }
        } else {
            await interaction.editReply({ content: 'You do not have permission to use this command', ephemeral: true });
        }
    },
};

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