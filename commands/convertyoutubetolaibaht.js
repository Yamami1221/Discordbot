const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('convertyoutubetolaibaht')
        .setDescription('Convert Youtube link to Laibaht link')
        .addStringOption(option =>
            option.setName('link')
                .setDescription('The Youtube link to convert')
                .setRequired(true)),
    async execute(interaction) {
        const link = interaction.options.getString('link');
        let laibahtLink;

        if (link.startsWith('https://www.youtube.com/watch?v=')) {
            laibahtLink = link.replace('www.youtube.com/watch?v=', 'play.laibaht.ovh/watch?v=');
        } else if (link.startsWith('https://youtu.be/')) {
            laibahtLink = link.replace('youtu.be/', 'play.laibaht.ovh/watch?v=');
        } else {
            await interaction.reply({ content: 'Please provide a valid Youtube link', ephemeral: true });
        }

        await interaction.reply({ content: `${laibahtLink}`, ephemeral: false });
    },
};