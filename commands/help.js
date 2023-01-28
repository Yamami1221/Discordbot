const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const { globaldata } = require('../data/global');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Help command'),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const serverData = globaldata.get(interaction.guildId) || undefined;
        if (serverData?.veriChannel) {
            if (interaction.channel.id === serverData.veriChannel.id) {
                const embed = new EmbedBuilder()
                    .setTitle('Verification')
                    .setDescription('You cannot use this command in the verification channel');
                await interaction.editReply({ embeds: [embed], ephemeral: true });
                return;
            }
        }
        const embed = new EmbedBuilder()
            .setTitle('Help')
            .setDescription('This is the help command')
            .setDescription('work in progress')
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    },
};