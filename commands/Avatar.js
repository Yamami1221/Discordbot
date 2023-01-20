const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('Avatar')
        .setDescription('Get the avatar URL of the selected user, or your own avatar.')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The user\'s avatar to show')
                .setRequired(false)),
    async execute(interaction) {
        await interaction.deferReply();
        const user = interaction.options.getUser('target') || interaction.user;
        const embed = new EmbedBuilder()
            .setTitle(`${user.username}'s Avatar`)
            .setImage(user.displayAvatarURL({ dynamic: true, size: 4096 }));
        await interaction.editReply({ embeds: [embed] });
    },
};