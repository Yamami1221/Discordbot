const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Sends an invite link to the bot'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('Invite Link')
            .setDescription('https://discord.com/api/oauth2/authorize?client_id=975433690874257458&permissions=8&scope=bot');
        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
};