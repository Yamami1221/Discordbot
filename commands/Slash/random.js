const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('random')
        .setDescription('Random number generator')
        .addIntegerOption(option =>
            option.setName('min')
                .setDescription('The minimum number')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('max')
                .setDescription('The maximum number')
                .setRequired(true)),
    async execute(interaction) {
        let min = interaction.options.getInteger('min');
        let max = interaction.options.getInteger('max');
        if (min > max) {
            const temp = min;
            min = max;
            max = temp;
        }
        const random = getRndInteger(min, max);
        const embed = new EmbedBuilder()
            .setTitle('Random Number Generator')
            .setDescription(`The random number between ${min} and ${max} is **${random}**!`);
        await interaction.reply({ embeds: [embed] });
    },
};

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}