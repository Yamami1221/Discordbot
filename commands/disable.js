const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('disable')
		.setDescription('disable text channel')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to disable')
                .setRequired(true)),
	async execute(interaction) {
        if (interaction.member.permissions.has('MANAGE_CHANNELS')) {
            const channel = interaction.options.getChannel('channel');
            if (channel) {
                await interaction.reply({ content: `Disabled ${channel}`, ephemeral: true });
                
            } else {
                await interaction.reply({ content: 'Please provide a channel', ephemeral: true });
            }
        } else {
            await interaction.reply({ content: 'You do not have permission to use this command', ephemeral: true });
        }
		await interaction.reply({ content: 'This command is not available', ephemeral: true });
	},
};