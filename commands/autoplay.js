const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const { globaldata } = require('../data/global');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('autoplay')
        .setDescription('Toggle autoplay on/off')
        .addBooleanOption(option =>
            option.setName('toggle')
                .setDescription('Toggle autoplay on/off')),
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
        const toggle = interaction.options.getBoolean('toggle');
        if (toggle) {
            const embed = new EmbedBuilder()
                .setTitle('Autoplay')
                .setDescription('Autoplay is now on');
            await interaction.reply({ embeds: [embed] });
        } else {
            const embed = new EmbedBuilder()
                .setTitle('Autoplay')
                .setDescription('Autoplay is now off');
            await interaction.reply({ embeds: [embed] });
        }
    },
};