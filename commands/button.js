const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('button')
		.setDescription('button test'),
	async execute(interaction) {
		const button = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('primary')
					.setLabel('Click me!')
					.setStyle(ButtonStyle.Primary),
			);
		await interaction.reply({ content: 'I think you should,', components: [button] });
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
			await i.update({ content: 'A button was clicked!', components: [link] });
		});

		collector.on('end', collected => console.log(`Collected ${collected.size} items`));
	},
};