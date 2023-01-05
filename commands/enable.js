const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');

const { globalqueue } = require('../global.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('enable')
        .setDescription('enable text channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .setDMPermission(false),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: false });
        if (interaction.member.permissions.has('MANAGE_CHANNELS')) {
            const serverqueue = globalqueue?.get(interaction.guild.id);
            if (!serverqueue) {
                const queueconstruct = {
                    textchannel: interaction.channel,
                    voicechannel: null,
                    connection: null,
                    songs: [],
                    volume: 50,
                    player: null,
                    resource: null,
                    playing: true,
                    loop: false,
                    shuffle: false,
                };
                globalqueue.set(interaction.guild.id, queueconstruct);
                const data = JSON.stringify(globalqueue, replacer);
                fs.writeFile('../data.json', data, function(err) {
                    if (err) {
                        console.log('There has been an error saving your configuration data.');
                        console.log(err.message);
                        return;
                    }
                });
                await interaction.editReply({ content: `Enabled ${interaction.channel.name} for music commands` });
            } else {
                if (serverqueue.textchannel.id == interaction.channel.id) {
                    await interaction.editReply({ content: 'This channel is already enabled' });
                    return;
                } else {
                    await interaction.editReply({ content: `The music commands is already enabled for <#${serverqueue.textchannel.id}>` });
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