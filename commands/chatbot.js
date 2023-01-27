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
    const serverQueue = globalqueue.get(interaction.guildId);
    if (!serverQueue) {
        const queueconstruct = {
            textchannel: [],
            voicechannel: null,
            connection: null,
            songs: [],
            volume: 50,
            player: null,
            resource: null,
            playing: false,
            loop: false,
            shuffle: false,
            autoplay: false,
            sound8d: false,
            bassboost: false,
            nightcore: false,
            veriRole: null,
            veriChannel: null,
            chatbotChannel: [],
        };
        globalqueue.set(interaction.guild.id, queueconstruct);
    }
    const serverqueue = globalqueue.get(interaction.guildId);
    if (interaction.channel.id === serverqueue.veriChannel?.id) {
        const overeri = new EmbedBuilder()
            .setTitle('Chat Bot')
            .setDescription('You cannot use verification channel as the chat bot channel');
        await interaction.editReply({ embeds: [overeri], ephemeral: true });
        return;
    }
    let enabled = false;
    for (let i = 0; i < serverqueue.chatbotChannel.length; i++) {
        if (serverqueue.chatbotChannel[i].id === interaction.channel.id) {
            enabled = true;
            break;
        }
    }
    if (enabled) {
        const embed = new EmbedBuilder()
            .setTitle('Chat Bot')
            .setDescription('Chat bot is already enabled in this channel');
        await interaction.editReply({ embeds: [embed], ephemeral: true });
        return;
    }
    serverqueue.chatbotChannel.push(interaction.channel);
    const embed = new EmbedBuilder()
        .setTitle('Chat Bot')
        .setDescription('Successfully enabled the chat bot in this channel');
    await interaction.editReply({ embeds: [embed] });
}

async function disableChatBot(interaction) {
    const serverQueue = globalqueue.get(interaction.guildId);
    if (!serverQueue) {
        const queueconstruct = {
            textchannel: [],
            voicechannel: null,
            connection: null,
            songs: [],
            volume: 50,
            player: null,
            resource: null,
            playing: false,
            loop: false,
            shuffle: false,
            autoplay: false,
            sound8d: false,
            bassboost: false,
            nightcore: false,
            veriRole: null,
            veriChannel: null,
            chatbotChannel: [],
        };
        globalqueue.set(interaction.guild.id, queueconstruct);
    }
    const serverqueue = globalqueue.get(interaction.guildId);
    if (interaction.channel.id === serverqueue.veriChannel?.id) {
        const overeri = new EmbedBuilder()
            .setTitle('Chat Bot')
            .setDescription('You cannot use this command in the verification channel');
        await interaction.editReply({ embeds: [overeri], ephemeral: true });
        return;
    }
    let enabled = false;
    for (let i = 0; i < serverqueue.chatbotChannel.length; i++) {
        if (serverqueue.chatbotChannel[i].id === interaction.channel.id) {
            enabled = true;
            break;
        }
    }
    if (!enabled) {
        const embed = new EmbedBuilder()
            .setTitle('Chat Bot')
            .setDescription('Chat bot is not enabled in this channel');
        await interaction.editReply({ embeds: [embed], ephemeral: true });
        return;
    }
    const index = serverqueue.chatbotChannel.indexOf(interaction.channel);
    serverqueue.chatbotChannel.splice(index, 1);
    const embed = new EmbedBuilder()
        .setTitle('Chat Bot')
        .setDescription('Successfully disabled the chat bot in this channel');
    await interaction.editReply({ embeds: [embed] });
}

async function teachChatBot(interaction) {
    const text = interaction.options.getString('text');
    const response = interaction.options.getString('response');
    try {
        const language = new Language();
        const langraw = await language.guess(text, [ 'en', 'th' ]);
        const lang = langraw[0].alpha2;
        const manager = new NlpManager({ languages: [lang], nlu: { log: false }, forceNER: true });
        manager.load('./model.nlp');
        manager.addDocument(lang, text, text);
        manager.addAnswer(lang, text, response);
        await manager.train();
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