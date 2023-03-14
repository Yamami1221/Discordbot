const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const memes = require('random-memes');

const { globaldata } = require('../data/global');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('randommeme')
        .setDescription('Random meme generator'),
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
        const meme = await memes.random();
        const embed = new EmbedBuilder()
            .setTitle('Random Meme')
            .setDescription(meme.caption)
            .setImage(meme.image);
        await interaction.editReply({ embeds: [embed] });
    },
};
