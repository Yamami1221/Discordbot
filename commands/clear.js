const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

const { globaldata } = require('../data/global');

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
            const serverQueue = globaldata.get(interaction.guildId) || undefined;
            if (serverQueue?.veriChannel) {
                if (interaction.channel.id === serverQueue.veriChannel.id) {
                    const embed = new EmbedBuilder()
                        .setTitle('Verification')
                        .setDescription('You cannot use this command in the verification channel');
                    await interaction.editReply({ embeds: [embed], ephemeral: true });
                    return;
                }
            }
            const amount = interaction.options.getInteger('amount');
            const messages = await interaction.channel.messages.fetch({ limit: amount });
            await interaction.channel.bulkDelete(messages);
            const embed = new EmbedBuilder()
                .setTitle('Clear')
                .setDescription(`Deleted ${messages.size - 1} messages!`);
            const sentMessage = await interaction.channel.send({ embeds: [embed] });
            setTimeout(() => {
                sentMessage.delete();
            }, 3000);
        } catch (error) {
            const embed = new EmbedBuilder()
                .setTitle('Clear')
                .setDescription('You can not delete messages that over 14 days old.');
            await interaction.channel.send({ embeds: [embed] });
        }
    },
};