const { Events, EmbedBuilder } = require('discord.js');
const { Language, NlpManager } = require('node-nlp');

const { globaldata } = require('../data/global');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.content === '<@975433690874257458>') {
            const embed = new EmbedBuilder()
                .setTitle('Help')
                .setColor('#ff8400')
                .setDescription('you can use `/help` to get help');
            message.reply({ content: 'What?', embeds: [embed] });
            return;
        } else if (message.content.startsWith('<@975433690874257458>')) {
            console.log(message.content);
            return;
        }
        if (message.author.bot) return;
        if (message.channel.type === 'DM') return;
        const serverdata = globaldata.get(message.guildId) || undefined;
        if (serverdata) {
            const enable = serverdata.chatbotChannel.find((channel) => channel.id === message.channel.id);
            if (enable) {
                try {
                    const language = new Language();
                    const langraw = await language.guess(message.content, [ 'en', 'th' ]);
                    const lang = langraw[0].alpha2;
                    const manager = new NlpManager({ languages: [lang], nlu: { log: false }, forceNER: true, autosave: false, autoSave: false });
                    manager.load('./data/model.nlp');
                    const response = await manager.process(lang, message.content);
                    if (response.answer) {
                        message.channel.send(response.answer);
                    }
                } catch (error) {
                    console.error(error);
                }
            } else {
                return;
            }
        }
    },
};