const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Deletes messages in a channel.')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('The amount of messages to delete.')
                .setMinValue(1)
                .setMaxValue(1000)
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .setDMPermission(false),
    async execute(interaction) {
        try {
            await interaction.deferReply();
            const amount = interaction.options.getInteger('amount');
            const messages = await interaction.channel.messages.fetch({ limit: amount + 1 });
            await interaction.channel.bulkDelete(messages);
            const embed = new EmbedBuilder()
                .setTitle('Clear')
                .setDescription(`Deleted ${messages.size - 1} messages!`);
            const sentMessage = await interaction.channel.send({ embeds: [embed] });
            setTimeout(() => {
                if (interaction.channel.messages.cache.has(sentMessage.id)) {
                    sentMessage.delete();
                }
            }, 1000);
        } catch (error) {
            const embed = new EmbedBuilder()
                .setTitle('Clear')
                .setDescription('You can not delete messages that over 14 days old.\nor\nAn error occurred while deleting messages');
            await interaction.channel.send({ embeds: [embed] });
        }
    },
};