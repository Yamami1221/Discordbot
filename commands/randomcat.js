const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const randomCat = require('random-cat-img');

const { globaldata } = require('../data/global');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('randomcat')
        .setDescription('get a random cat image'),
    async execute(interaction) {
        await interaction.deferReply();
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
        const resdata = await randomCat();
        const imglink = resdata.data.message;
        const embed = new EmbedBuilder()
            .setTitle('Random Cat')
            .setDescription('Here is a random cat image')
            .setImage(imglink)
            .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
    },
};