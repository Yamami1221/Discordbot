const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('d')
        .setDescription('d'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('Deez Nuts')
            .setDescription('Ha! Got you!');
        await interaction.reply({ embeds: [embed] });
    },
};