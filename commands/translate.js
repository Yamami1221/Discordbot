const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const translate = require('translate-google');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('translate')
        .setDescription('Translate text to another language')
        .addStringOption(option =>
            option
                .setName('text')
                .setDescription('The text to translate')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('language')
                .setDescription('The language to translate to')),
    async execute(interaction) {
        await interaction.deferReply();
        const text = interaction.options.getString('text');
        const language = interaction.options.getString('language') || 'en';
        try {
            const translated = await translate(text, { to: language });
            const embed = new EmbedBuilder()
                .setTitle('Translation')
                .setDescription(`\`${translated}\``)
                .setFooter({ text:`Requested by ${interaction.user.username}`, iconURL:interaction.user.displayAvatarURL({ dynamic: true, size: 2048 }) })
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            const embed = new EmbedBuilder()
                .setTitle('Translation')
                .setDescription('An error occured while translating')
                .setFooter({ text:`Requested by ${interaction.user.username}`, iconURL:interaction.user.displayAvatarURL({ dynamic: true, size: 2048 }) })
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        }
    },
};