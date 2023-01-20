const { ContextMenuCommandBuilder, EmbedBuilder, ApplicationCommandType } = require('discord.js');

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('Avatar')
        .setType(ApplicationCommandType.User),
    async execute(interaction) {
        await interaction.deferReply();
        const user = interaction.targetUser;
        const embed = new EmbedBuilder()
            .setTitle(`**${user.username}'s Avatar**`)
            .setImage(user.displayAvatarURL({ dynamic: true, size: 4096 }));
        await interaction.editReply({ embeds: [embed] });
    },
};