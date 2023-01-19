const { SlashCommandBuilder, EmbedBuilder, Client, GatewayIntentBits } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Shows the stats of (sharding) the bot'),
    async execute(interaction) {
        const guildcount = await client.shard.fetchClientValues('guilds.cache.size');
        const usercount = await client.shard.fetchClientValues('users.cache.size');
        const channelcount = await client.shard.fetchClientValues('channels.cache.size');
        try {
            const embed = new EmbedBuilder()
                .setTitle('Stats')
                .setDescription(`Stats of the bot:\n\nServers: ${guildcount.reduce((acc, guildCount) => acc + guildCount, 0)}\nUsers: ${usercount.reduce((accc, userCount) => accc + userCount, 0)}\nChannels: ${channelcount.reduce((acccc, channelCount) => acccc + channelCount, 0)}\n\n(These are the current stats, they may not be accurate.)`);
            return interaction.reply({ embeds: [embed] });
        } catch (err) {
            console.log(err);
        }
    },
};