const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { CatWithTextGenerator } = require('cats-generator');
const fs = require('fs');

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
        const catGenerator = new CatWithTextGenerator();
        const catToWrite = await catGenerator.getImage();
        const bufferToWrite = catToWrite.toBuffer();
        fs.writeFileSync('cat.png', bufferToWrite);
        const file = fs.readFileSync('cat.png');
        const attachment = new AttachmentBuilder(file, 'cat.png');
        const embed = new EmbedBuilder()
            .setTitle('Random Cat')
            .setDescription('Here is a random cat image')
            .setURL('https://www.google.co.th/imghp?hl=en')
            .setImage('attachment://cat.png');
        await interaction.editReply({ embeds: [embed], files: [attachment] });
    },
};