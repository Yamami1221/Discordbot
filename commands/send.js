const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

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
        await interaction.deferReply({ ephemeral: true });
        const channel = interaction.options.getChannel('channel');
        const message = interaction.options.getString('message');
        const embed = new EmbedBuilder()
            .setTitle('Send')
            .setDescription('Message sent!');
        await interaction.editReply({ embeds: [embed], ephemeral: true });
        const pendingmessage = new EmbedBuilder()
            .setTitle('Send')
            .setDescription(`${message}`)
            .setFooter({ text:`Requested by ${interaction.user.username}`, iconURL:interaction.user.displayAvatarURL({ dynamic: true, size: 2048 }) });
        await channel.send({ embeds: [pendingmessage] });
    },
};