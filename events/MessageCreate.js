const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.content === '<@975433690874257458>') {
            const embed = new EmbedBuilder()
                .setTitle('Help')
                .setColor('#ff8400')
                .setDescription('you can use `/help` to get help');
            message.reply({ content: 'What?', embeds: [embed] });
        } else if (message.content.startsWith('<@975433690874257458>')) {
            console.log(message.content);
        }
        if (message.author.bot) return;
        if (message.channel.type === 'DM') return;
        if (!message.content.startsWith(process.env.PREFIX)) return;
    },
};