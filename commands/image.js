require('dotenv').config();
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const imageSearch = require('image-search-google');

const { globaldata } = require('../data/global');

const client = new imageSearch(process.env.CSE_ID, process.env.GOOGLE_API_KEY);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('image')
        .setDescription('Searches for an image on Google')
        .addStringOption(option =>
            option
                .setName('query')
                .setDescription('The query to search for')
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
        const option = { page: 1 };
        const query = interaction.options.getString('query');
        const results = await client.search(query, option);
        results.length = 4;
        const embed = new EmbedBuilder()
            .setTitle('Image Search')
            .setDescription(`Results for ${query}`)
            .setTimestamp();
        if (results.length > 0) {
            const embed1 = new EmbedBuilder()
                .setTitle('Image Search')
                .setDescription(`Results for ${query}`)
                .setURL('https://www.google.co.th/imghp?hl=en')
                .setImage(results[0].url)
                .setFooter({ text:'Powered by Google' })
                .setTimestamp();
            const embed2 = new EmbedBuilder()
                .setURL('https://www.google.co.th/imghp?hl=en')
                .setImage(results[1].url);
            const embed3 = new EmbedBuilder()
                .setURL('https://www.google.co.th/imghp?hl=en')
                .setImage(results[2].url);
            const embed4 = new EmbedBuilder()
                .setURL('https://www.google.co.th/imghp?hl=en')
                .setImage(results[3].url);
            await interaction.editReply({ embeds: [embed1, embed2, embed3, embed4] });
        } else {
            embed.setDescription('No results found');
            await interaction.editReply({ embeds: [embed] });
        }
    },
};