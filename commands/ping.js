const { SlashCommandBuilder, EmbedBuilder, Client, GatewayIntentBits } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    async execute(interaction) {
        const sent = await interaction.reply({ content: '**Pinging...**', fetchReply: true });
        const embed = new EmbedBuilder()
            .setTitle('🏓Pong!')
            .setDescription(`Roundtrip latency: **${sent.createdTimestamp - interaction.createdTimestamp}ms**\n API latency: **${client.shard.client.ws.ping}ms**`);
        interaction.editReply({ embeds: [embed], empheral: true });
    },
};