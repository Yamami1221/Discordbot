const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ligma')
        .setDescription('ligma'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('ligma balls')
            .setDescription('Ha! Got you!');
        await interaction.reply({ embeds: [embed] });
    },
};