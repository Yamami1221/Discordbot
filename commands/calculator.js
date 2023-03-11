const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const { globaldata } = require('../data/global');

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
        const serverData = globaldata.get(interaction.guildId) || undefined;
        if (serverData?.veriChannel) {
            if (interaction.channel.id === serverData.veriChannel.id) {
                const embed = new EmbedBuilder()
                    .setTitle('Verification')
                    .setDescription('You cannot use this command in the verification channel');
                await interaction.editReply({ embeds: [embed], ephemeral: true });
                return;
            }
        }
        const expression = interaction.options.getString('expression');
        const sanitizedExpression = expression.replace(/[^0-9+\-*/.()]/g, '');
        if (sanitizedExpression !== expression) {
            const errorEmbed = new EmbedBuilder()
                .setTitle('Calculator')
                .setDescription('Invalid expression')
                .setTimestamp();
            await interaction.editReply({ embeds: [errorEmbed] });
            return;
        }
        const embed = new EmbedBuilder()
            .setTitle('Calculator')
            .setDescription(`**${expression}** = ${eval(expression)}`)
            .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
    },
};