const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Deletes messages in a channel.')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('The amount of messages to delete.')
                .setMinValue(1)
                .setMaxValue(100)
                .setRequired(true)),
    async execute(interaction) {
        try {
            await interaction.deferReply();
            const amount = interaction.options.getInteger('amount');
            const messages = await interaction.channel.messages.fetch({ limit: amount });
            await interaction.channel.bulkDelete(messages);
            await interaction.channel.send(`Deleted ${amount} messages!`);
        } catch (error) {
            await interaction.editReply({ content: 'You can not delete messages that over 14 days old.', ephemeral: true });
        }
    },
};