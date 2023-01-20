const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                const embed = new EmbedBuilder()
                    .setTitle('Error')
                    .setDescription(`No command matching ${interaction.commandName} was found.`);
                await interaction.reply({ embeds: [embed], ephemeral: true });
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }

            try {
                await command.execute(interaction);
            } catch (error) {
                const deffered = await interaction.fetchReply();
                if (!deffered) {
                    interaction.defferReply({ ephemeral: true });
                }
                const embed = new EmbedBuilder()
                    .setTitle('Error')
                    .setDescription('There was an error while executing this command!');
                interaction.editReply({ embeds: [embed], ephemeral: true });
                console.error(`Error executing ${interaction.commandName}`);
                console.error(error);
            }
        } else if (interaction.isAutocomplete()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }

            try {
                await command.autocomplete(interaction);
            } catch (error) {
                console.error(error);
            }
        } else if (interaction.isContextMenuCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                console.log(interaction.client);
                const embed = new EmbedBuilder()
                    .setTitle('Error')
                    .setDescription(`No context menu matching ${interaction.commandName} was found.`);
                await interaction.reply({ embeds: [embed], ephemeral: true });
                console.error(`No context menu matching ${interaction.commandName} was found.`);
                return;
            }

            try {
                await command.execute(interaction);
            } catch (error) {
                const deffered = await interaction.fetchReply();
                if (!deffered) {
                    interaction.defferReply({ ephemeral: true });
                }
                const embed = new EmbedBuilder()
                    .setTitle('Error')
                    .setDescription('There was an error while executing this command!');
                interaction.editReply({ embeds: [embed], ephemeral: true });
                console.error(`Error executing ${interaction.commandName}`);
                console.error(error);
            }
        } else if (interaction.isButton()) {
            return;
        } else if (!interaction.isCommand()) {
            return;
        }
    },
};