const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const { globalqueue } = require('../global.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('guide')
        .setDescription('Search discordjs.guide!')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('Phrase to search for')
                .setAutocomplete(true)),
    async autocomplete(interaction) {
        const serverQueue = globalqueue.get(interaction.guildId) || undefined;
        if (serverQueue?.veriChannel) {
            if (interaction.channel.id === serverQueue.veriChannel.id) {
                const embed = new EmbedBuilder()
                    .setTitle('Verification')
                    .setDescription('You cannot use this command in the verification channel');
                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }
        }
        const focusedOption = interaction.options.getFocused(true);
        let choices;

        if (focusedOption.name === 'query') {
            choices = ['Popular Topics: Threads', 'Sharding: Getting started', 'Library: Voice Connections', 'Interactions: Replying to slash commands', 'Popular Topics: Embed preview'];
        }

        if (focusedOption.name === 'version') {
            choices = ['v9', 'v11', 'v12', 'v13', 'v14'];
        }

        const filtered = choices.filter(choice => choice.startsWith(focusedOption.value));
        await interaction.respond(
            filtered.map(choice => ({ name: choice, value: choice })),
        );
    },
    async execute(interaction) {
        await interaction.reply({ content: 'This command is not available(dev don\'t even know why we have this.)', ephemeral: true });
    },
};