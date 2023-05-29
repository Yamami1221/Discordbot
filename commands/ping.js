const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    async execute(interaction, client) {
        await interaction.deferReply();
        const messagesent = await interaction.channel.send('Pinging...');
        const roundTripLatency = messagesent.createdTimestamp - interaction.createdTimestamp;
        await messagesent.delete();
        const apiLatency = client.shard.client.ws.ping;
        const embed = new EmbedBuilder()
            .setTitle('🏓Pong!')
            .setDescription(`Roundtrip latency: **${roundTripLatency}ms**\n API latency: **${apiLatency}ms**`);
        interaction.editReply({ embeds: [embed] });
    },
};