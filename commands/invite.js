const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const { globaldata } = require('../data/global');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Sends an invite link to the bot'),
    async execute(interaction) {
        const serverData = globaldata.get(interaction.guildId) || undefined;
        if (serverData?.veriChannel) {
            if (interaction.channel.id === serverData.veriChannel.id) {
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