const { Events } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.content === '<@975433690874257458>') {
            message.reply(`What?(embed message will be added soon)`);
        }
        if (message.author.bot) return;
        if (message.channel.type === 'DM') return;
        if (!message.content.startsWith(process.env.PREFIX)) return;
    },
};