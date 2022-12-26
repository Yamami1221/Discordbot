const { Events } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        console.log(message);
        // if (message.author.bot) return;
        // if (message.channel.type === 'DM') return;
        // if (!message.content.startsWith(process.env.PREFIX)) return;
    },
};