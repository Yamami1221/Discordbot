const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');

const { globalqueue } = require('../global.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('enable')
        .setDescription('enable text channel')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to enable')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .setDMPermission(false),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: false });
        if (interaction.member.permissions.has('MANAGE_CHANNELS')) {
            const channel = interaction.options.getChannel('channel');
            const serverqueue = globalqueue?.get(interaction.guild.id);
            console.log(globalqueue);
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
                await interaction.editReply({ content: `Enabled ${channel} for music commands` });
            } else {
                if (serverqueue.textchannel.id == channel.id) {
                    await interaction.editReply({ content: 'This channel is already enabled' });
                    return;
                } else {
                    await interaction.editReply({ content: `This channel is already enabled for ${serverqueue.textchannel.name}` });
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
            // eslint-disable-next-line no-inline-comments
            value: Array.from(value.entries()), // or with spread: value: [...value]
        };
    } else {
        return value;
    }
}