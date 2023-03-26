const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('button')
        .setDescription('button test'),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const button = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('rr_primary')
                    .setLabel('Click me!')
                    .setStyle(ButtonStyle.Primary),
            );
        await interaction.editReply({ content: 'I think you should,', components: [button], ephemeral: true });
        const filter = i => i.customId === 'rr_primary';

        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

        collector.on('collect', async i => {
            const link = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setURL('https://youtu.be/dQw4w9WgXcQ')
                        .setLabel('Click me!')
                        .setStyle(ButtonStyle.Link),
                );
            await i.update({ content: 'Hmmm you should click me again', components: [link], ephemeral: true });
        });

        collector.on('end', async () => {
            await interaction.editReply({ content: 'You did not click me in time', components: [], ephemeral: true });
        });
    },
};