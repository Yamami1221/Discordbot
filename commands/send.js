const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('send')
        .setDescription('Send a message to a channel')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to send the message to')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The message to send')
                .setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply();
        const channel = interaction.options.getChannel('channel');
        const message = interaction.options.getString('message');
        await channel.send(message);
        await interaction.editReply('Message sent!');
    },
};