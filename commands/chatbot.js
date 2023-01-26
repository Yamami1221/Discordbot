const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const { globalqueue } = require('../global.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('chatbot')
        .setDescription('Chat bot management')
        .addSubcommand(subcommand =>
            subcommand
                .setName('enable')
                .setDescription('Enable the chat bot in the current channel'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('disable')
                .setDescription('Disable the chat bot in the current channel'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('teach')
                .setDescription('Teach the chat bot')
                .addStringOption(option =>
                    option
                        .setName('text')
                        .setDescription('The text to teach the chat bot')
                        .setRequired(true))
                .addStringOption(option =>
                    option
                        .setName('response')
                        .setDescription('The response to the text(for multiple responses, separate them with a comma)')
                        .setRequired(true))),
    async execute(interaction) {
        await interaction.deferReply();
        const serverQueue = globalqueue.get(interaction.guildId) || undefined;
        if (serverQueue?.veriChannel) {
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
            enableChatBot(interaction);
        } else if (subcommand === 'disable') {
            disableChatBot(interaction);
        } else if (subcommand === 'teach') {
            teachChatBot(interaction);
        }
    },
};

async function enableChatBot(interaction) {
    const embed = new EmbedBuilder()
        .setTitle('Chat Bot')
        .setDescription('This feature is not yet available');
    await interaction.editReply({ embeds: [embed], ephemeral: true });
}

async function disableChatBot(interaction) {
    const embed = new EmbedBuilder()
        .setTitle('Chat Bot')
        .setDescription('This feature is not yet available');
    await interaction.editReply({ embeds: [embed], ephemeral: true });
}

async function teachChatBot(interaction) {
    const embed = new EmbedBuilder()
        .setTitle('Chat Bot')
        .setDescription('This feature is not yet available');
    await interaction.editReply({ embeds: [embed], ephemeral: true });
}