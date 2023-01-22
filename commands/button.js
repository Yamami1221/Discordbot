const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const { globalqueue } = require('../global.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('button')
        .setDescription('button test'),
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
        const button = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('primary')
                    .setLabel('Click me!')
                    .setStyle(ButtonStyle.Primary),
            );
        await interaction.editReply({ content: 'I think you should,', components: [button] });
        const filter = i => i.customId === 'primary';

        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

        collector.on('collect', async i => {
            const link = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setURL('https://youtu.be/dQw4w9WgXcQ')
                        .setLabel('Click me!')
                        .setStyle(ButtonStyle.Link),
                );
            await i.update({ content: 'Hmmm you should click me again', components: [link] });
        });

        collector.on('end', async collected => {
            console.log(`Collected ${collected.size} items`);
            await interaction.editReply({ content: 'You did not click me in time', components: [] });
        });
    },
};