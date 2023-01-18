const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');

const { globalqueue } = require('../global.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('disable')
        .setDescription('disable text channel for music commands')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .setDMPermission(false),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: false });
        if (interaction.member.permissions.has('MANAGE_CHANNELS')) {
            const serverqueue = globalqueue?.get(interaction.guild.id);
            if (!serverqueue) {
                await interaction.editReply({ content: `${interaction.guild.name} in not enabled for music commands`, ephemeral: true });
                return;
            } else {
                let enabled = false;
                for (let i = 0; i < serverqueue.textchannel.length; i++) {
                    if (serverqueue.textchannel[i].id === interaction.channel.id) {
                        enabled = true;
                    }
                }
                if (enabled === true) {
                    const textchannelforshowloc = serverqueue.textchannel.indexOf(interaction.channel);
                    serverqueue.textchannel.splice(textchannelforshowloc, 1);
                    await interaction.editReply({ content: `Disabled <#${interaction.channel.id}> for music commands` });
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
                    await interaction.editReply({ content: `<#${interaction.channel.id}> is already disabled`, ephemeral: true });
                    return;
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