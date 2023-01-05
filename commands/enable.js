const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

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
        if (interaction.member.permissions.has('MANAGE_CHANNELS')) {
            const channel = interaction.options.getChannel('channel');
            console.log(channel);
            const serverqueue = globalqueue.get(interaction.guild.id);
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
            }
        } else {
            await interaction.reply({ content: 'You do not have permission to use this command', ephemeral: true });
        }
    },
};