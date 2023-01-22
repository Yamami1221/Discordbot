const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const { globalqueue } = require('../global.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Sends an invite link to the bot'),
    async execute(interaction) {
        const serverQueue = globalqueue.get(interaction.guildId);
        if (serverQueue.veriChannel) {
            if (interaction.channel.id === serverQueue.veriChannel.id) {
                const embed = new EmbedBuilder()
                    .setTitle('Verification')
                    .setDescription('You cannot use this command in the verification channel');
                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }
        }
        const embed = new EmbedBuilder()
            .setTitle('Invite Link')
            .setDescription('https://discord.com/api/oauth2/authorize?client_id=975433690874257458&permissions=8&scope=bot');
        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
};