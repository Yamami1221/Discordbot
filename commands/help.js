const { SlashCommandBuilder, MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Help command'),
    async execute(interaction) {
        const embed = new MessageEmbed()
            .setTitle('Help(not done yet))')
            .setDescription('This is a help command')
            .setColor('RANDOM')
            .setFooter('This is a footer')
            .setTimestamp()
            .addFields(
                { name: 'Help', value: 'This is a help command' },
            );
        await interaction.reply({ embeds: [embed] });
    },
};