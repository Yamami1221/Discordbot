const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('clear')
		.setDescription('Deletes messages in a channel.')
                .addIntegerOption(option => 
                    option.setName('amount')
                    .setDescription('The amount of messages to delete.')
                    .setMinValue(1)
                    .setMaxValue(100)
                    .setRequired(true)),
	async execute(interaction) {
        await interaction.deferReply();
        var amount = interaction.options.getInteger('amount');
        var messages = await interaction.channel.messages.fetch({ limit: amount });
        console.log(messages);
        await interaction.channel.bulkDelete(messages);
        await interaction.channel.send(`Deleted ${amount} messages!`);
	},
};