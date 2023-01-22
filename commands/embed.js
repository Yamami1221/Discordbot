const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('embed')
        .setDescription('Sends an embed.')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to send the embed in')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('title')
                .setDescription('The title of the embed')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('description')
                .setDescription('The description of the embed')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('color')
                .setDescription('The color of the embed'))
        .addAttachmentOption(option =>
            option.setName('image')
                .setDescription('The image to send in the embed')),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const image = await interaction.options.getAttachment('image');
        const channel = interaction.options.getChannel('channel');
        const title = interaction.options.getString('title');
        const description = interaction.options.getString('description');
        const color = interaction.options.getString('color') || 0x000000;
        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor(color)
            .setImage(image ? image.proxyURL : null)
            .setFooter({ text:`Requested by ${interaction.user.username}`, iconURL:interaction.user.displayAvatarURL({ dynamic: true, size: 2048 }) })
            .setTimestamp();
        await interaction.editReply({ content: `Embed sent to ${channel.toString()}`, ephemeral: true });
        await channel.send({ embeds: [embed] });
    },
};