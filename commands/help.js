const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Help command'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('Help')
            .setDescription('This is the help command')
            .setDescription('work in progress')
            .setColor('#FF0000')
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    },
};