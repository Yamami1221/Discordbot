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
                    if (langraw.length === 0) return;
                    if (!langraw[0]?.alpha2) return;
                    const lang = langraw[0].alpha2;
                    const manager = new NlpManager({ languages: [lang], nlu: { log: false }, forceNER: true, autosave: false, autoSave: false });
                    manager.load('./data/model.nlp');
                    const response = await manager.process(lang, message.content);
                    if (response.answer) {
                        if (response.answer.length <= 2000) {
                            message.channel.send(response.answer);
                        } else {
                            response.answer = await response.answer.slice(0, 2000);
                            message.channel.send(response.answer);
                        }
                    } else {
                        const embed = new EmbedBuilder()
                            .setTitle('ตอนนี้ผมยังไม่ค่อยรู้เรื่องเท่าไหร่ ขอโทษด้วยนะครับ')
                            .setDescription('ผมเรียนรู้จากการสนทนาของคุณ ถ้าคุณอยากให้ผมเรียนรู้เรื่องอะไร ให้พิมพ์ `/chatbot teach` แล้วตามด้วยข้อความที่คุณอยากให้ผมเรียนรู้')
                            .addFields({ name: 'วิธีสอน', value: 'พิมพ์ `/chatbot teach` text:[คำถามจากเรา] respond:[คำตอบจากบอท]' })
                            .addFields({ name: 'ตัวอย่าง', value: '`/chatbot teach text:สวัสดี respond:สวัสดีเช่นกันจ้า`\n`/chatbot teach text:กินอะไรดี respond:ข้าว`' });
                        message.channel.send({ embeds: [embed] });
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