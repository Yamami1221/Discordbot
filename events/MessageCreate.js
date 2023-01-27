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
        const serverqueue = globaldata.get(message.guildId) || undefined;
        if (serverqueue) {
            let enable = false;
            for (let i = 0; i < serverqueue.chatbotChannel.length; i++) {
                if (serverqueue.chatbotChannel[i].id === message.channel.id) {
                    enable = true;
                    break;
                }
            }
            if (enable) {
                try {
                    const language = new Language();
                    const langraw = await language.guess(message.content, [ 'en', 'th' ]);
                    const lang = langraw[0].alpha2;
                    const manager = new NlpManager({ languages: [lang], nlu: { log: false }, forceNER: true });
                    manager.load('./data/model.nlp');
                    const response = await manager.process(lang, message.content);
                    message.channel.send(response.answer);
                } catch (error) {
                    console.error(error);
                }
            }
        }
    },
};