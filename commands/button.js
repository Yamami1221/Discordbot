const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('button')
        .setDescription('button test'),
    async execute(interaction) {
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('primary')
                    .setLabel('Click me!')
                    .setStyle(ButtonStyle.Primary),
            );
        await interaction.reply({ content: 'I think you should,', components: [row] });
        const filter = i => i.customId === 'primary';

        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

        collector.on('collect', async i => {
            const link = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setURL('https://discord.gg/invite/invite')
                    .setLabel('Click me!')
                    .setStyle(ButtonStyle.Link),
            );
            await i.update({ content: 'A button was clicked!', components: [link] });
        });

        collector.on('end', collected => console.log(`Collected ${collected.size} items`));
    }
};