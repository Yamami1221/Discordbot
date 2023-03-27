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
        const bufferToWrite = Buffer.from(catToWrite.toBuffer());
        fs.writeFileSync('cat.png', bufferToWrite);
        const attachment = new AttachmentBuilder('cat.png');
        const embed = new EmbedBuilder()
            .setTitle('Random Cat')
            .setDescription('Here is a random cat image')
            .setImage('attachment://cat.png')
            .setTimestamp();
        await interaction.editReply({ embeds: [embed], files: [attachment] });
        if (fs.existsSync('cat.png')) {
            fs.unlinkSync('cat.png');
        }
    },
};