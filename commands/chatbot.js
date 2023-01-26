const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Language, NlpManager } = require('node-nlp');

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
    const text = interaction.options.getString('text');
    const response = interaction.options.getString('response');
    try {
        const language = new Language();
        const langraw = await language.guess(text, [ 'en', 'th' ]);
        const lang = langraw[0].alpha2;
        const manager = new NlpManager({ languages: [lang] });
        manager.load('./model.nlp');
        manager.addDocument(lang, text, text);
        manager.addAnswer(lang, text, response);
        manager.train();
        manager.save('./model.nlp');
        const embed = new EmbedBuilder()
            .setTitle('Chat Bot')
            .setDescription('Successfully taught the chat bot');
        await interaction.editReply({ embeds: [embed] });
    } catch (error) {
        const embed = new EmbedBuilder()
            .setTitle('Chat Bot')
            .setDescription('Failed to teach the chat bot');
        await interaction.editReply({ embeds: [embed], ephemeral: true });
        console.error(error);
    }
}