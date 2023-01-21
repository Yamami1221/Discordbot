const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('calculator')
        .setDescription('A calculator.')
        .addStringOption(option =>
            option.setName('expression')
                .setDescription('The expression to evaluate')
                .setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const expression = interaction.options.getString('expression');
        const embed = new EmbedBuilder()
            .setTitle('Calculator')
            .setDescription(`**${expression}** = ${eval(expression)}`)
            .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
    },
};