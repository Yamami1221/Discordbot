const { SlashCommandBuilder, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder } = require('discord.js');

const { globaldata } = require('../data/global');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('modaltest')
        .setDescription('Tests modals.'),
    async execute(interaction) {
        const serverData = globaldata.get(interaction.guildId);
        if (serverData?.veriChannel) {
            if (interaction.channel.id === serverData.veriChannel.id) {
                const embed = new EmbedBuilder()
                    .setTitle('Verification')
                    .setDescription('You cannot use this command in the verification channel');
                await interaction.editReply({ embeds: [embed], ephemeral: true });
                return;
            }
        }
        // Create the modal
        const modal = new ModalBuilder()
            .setCustomId('modaltest')
            .setTitle('Test Modal');

        // Add components to modal

        // Create the text input components
        const favoriteColorInput = new TextInputBuilder()
            .setCustomId('favoriteColorInput')
        // The label is the prompt the user sees for this input
            .setLabel('What\'s your favorite color?')
        // Short means only a single line of text
            .setStyle(TextInputStyle.Short);

        const hobbiesInput = new TextInputBuilder()
            .setCustomId('hobbiesInput')
            .setLabel('What\'s some of your favorite hobbies?')
        // Paragraph means multiple lines of text.
            .setStyle(TextInputStyle.Paragraph);

        // An action row only holds one text input,
        // so you need one action row per text input.
        const firstActionRow = new ActionRowBuilder().addComponents(favoriteColorInput);
        const secondActionRow = new ActionRowBuilder().addComponents(hobbiesInput);

        // Add inputs to the modal
        modal.addComponents(firstActionRow, secondActionRow);

        // Show the modal to the user
        await interaction.showModal(modal);
    },
    async modal(interaction) {
        // Get the values of the inputs
        const favoriteColor = interaction.fields.fields.get('favoriteColorInput').value;
        const hobbies = interaction.fields.fields.get('hobbiesInput').value;

        // Create an embed to show the user their input
        const embed = new EmbedBuilder()
            .setTitle('Your Input')
            .setDescription(`Your favorite color is ${favoriteColor} and your favorite hobbies are ${hobbies}.`);

        // Send the embed to the user
        await interaction.channel.send({ embeds: [embed], ephemeral: true });
        interaction.deferUpdate();
    },
};