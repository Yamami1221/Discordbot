const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const { globalqueue } = require('../global.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('echo')
        .setDescription('Replies with your input!')
        .addStringOption(option =>
            option.setName('input')
                .setDescription('The input to echo back')
                .setRequired(true))
        .addBooleanOption(option =>
            option.setName('ephemeral')
                .setDescription('Whether or not the echo should be ephemeral')),
    async execute(interaction) {
        await interaction.deferReply();
        const serverQueue = globalqueue.get(interaction.guildId);
        if (serverQueue.veriChannel) {
            if (interaction.channel.id === serverQueue.veriChannel.id) {
                const embed = new EmbedBuilder()
                    .setTitle('Verification')
                    .setDescription('You cannot use this command in the verification channel');
                await interaction.editReply({ embeds: [embed], ephemeral: true });
                return;
            }
        }
        const input = interaction.options.getString('input');
        const ephemeral = interaction.options.getBoolean('ephemeral');
        const embed = new EmbedBuilder()
            .setTitle('Echo')
            .setDescription(`Message: ${input}`)
            .setFooter(`Requested by ${interaction.user.tag}`);
        await interaction.deleteReply();
        await interaction.channel.send({ embeds: [embed], ephemeral: ephemeral });
    },
};
