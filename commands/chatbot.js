const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const { globalqueue } = require('../global.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('chatbot')
        .setDescription('Chat bot management')
        .addSubcommand(subcommand =>
            subcommand
                .setName('enable')
                .setDescription('Enable the chat bot'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('disable')
                .setDescription('Disable the chat bot')),
    async execute(interaction) {
        await interaction.deferReply();
        const serverQueue = globalqueue.get(interaction.guildId) || undefined;
        if (serverQueue.veriChannel) {
            if (interaction.channel.id === serverQueue.veriChannel.id) {
                const embed = new EmbedBuilder()
                    .setTitle('Verification')
                    .setDescription('You cannot use this command in the verification channel');
                await interaction.editReply({ embeds: [embed], ephemeral: true });
                return;
            }
        }
        const subcommand = interaction.options.getSubcommand();
        if (subcommand === 'enable') {
            const embed = new EmbedBuilder()
                .setTitle('Chat Bot')
                .setDescription('This feature is not yet available');
            await interaction.editReply({ embeds: [embed], ephemeral: true });
        }
        else if (subcommand === 'disable') {
            const embed = new EmbedBuilder()
                .setTitle('Chat Bot')
                .setDescription('This feature is not yet available');
            await interaction.editReply({ embeds: [embed], ephemeral: true });
        }
    },
};