const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Get a user\'s avatar')
        .addUserOption(option => option.setName('user')
            .setDescription('The user\'s avatar to show')),
    async execute(interaction) {
        await interaction.deferReply();
        const user = interaction.options.getUser('user') || interaction.user;

        const embed = new EmbedBuilder()
            .setTitle(`**${user.username}'s Avatar**`)
            .setImage(user.displayAvatarURL({ size: 2048 }))
            .setFooter({ text:`Requested by ${interaction.user.username}`, iconURL:interaction.user.displayAvatarURL({ dynamic: true, size: 2048 }) })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    },
};