const { ContextMenuCommandBuilder, EmbedBuilder, ApplicationCommandType } = require('discord.js');

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('Avatar')
        .setType(ApplicationCommandType.User),
    async execute(interaction) {
        await interaction.deferReply();
        const user = interaction.guild.members.cache.get(interaction.targetId) || interaction.user;

        const embed = new EmbedBuilder()
            .setTitle(`**${user.user.username}'s Avatar**`)
            .setImage(user.displayAvatarURL({ size: 2048 }));

        await interaction.editReply({ embeds: [embed] });
    },
};