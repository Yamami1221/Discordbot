const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('enable')
		.setDescription('enable text channel')
        .addChannelOption(option => 
            option.setName('channel')
                .setDescription('The channel to enable')
                .setRequired(true)),
	async execute(interaction) {
        if (interaction.member.permissions.has('MANAGE_CHANNELS')) {
            const channel = interaction.options.getChannel('channel');
            if (channel) {
                channel.updateOverwrite(interaction.guild.roles.everyone, {
                    SEND_MESSAGES: true,
                });
                await interaction.reply({ content: `Enabled ${channel}`, ephemeral: true });
                
            } else {
                await interaction.reply({ content: 'Please provide a channel', ephemeral: true });
            }
        } else {
            await interaction.reply({ content: 'You do not have permission to use this command', ephemeral: true });
        }
	},
};