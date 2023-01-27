const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const { globaldata } = require('../data/global');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('convertyoutubetolaibaht')
        .setDescription('Convert Youtube link to Laibaht link')
        .addStringOption(option =>
            option.setName('link')
                .setDescription('The Youtube link to convert')
                .setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply();
        const serverQueue = globaldata.get(interaction.guildId) || undefined;
        if (serverQueue?.veriChannel) {
            if (interaction.channel.id === serverQueue.veriChannel.id) {
                const embed = new EmbedBuilder()
                    .setTitle('Verification')
                    .setDescription('You cannot use this command in the verification channel');
                await interaction.editReply({ embeds: [embed], ephemeral: true });
                return;
            }
        }
        const link = interaction.options.getString('link');
        let laibahtLink;

        if (link.startsWith('https://www.youtube.com/watch?v=')) {
            laibahtLink = link.replace('www.youtube.com/watch?v=', 'play.laibaht.ovh/watch?v=');
        } else if (link.startsWith('https://youtu.be/')) {
            laibahtLink = link.replace('youtu.be/', 'play.laibaht.ovh/watch?v=');
        } else {
            await interaction.editReply({ content: 'Please provide a valid Youtube link', ephemeral: true });
        }

        await interaction.editReply({ content: `${laibahtLink}`, ephemeral: false });
    },
};