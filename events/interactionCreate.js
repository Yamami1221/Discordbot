const { Events } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                interaction.reply({ content: `No command matching ${interaction.commandName} was found.`, ephemeral: true });
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
                interaction.editReply({ content: 'There was an error while executing this command!', ephemeral: true });
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
        } else if (interaction.isUserContextMenuCommand()) {
            console.log(interaction.client);
            const command = interaction.client.contextMenus.get(interaction.commandName);

            if (!command) {
                interaction.reply({ content: `No context menu matching ${interaction.commandName} was found.`, ephemeral: true });
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
                interaction.editReply({ content: 'There was an error while executing this command!', ephemeral: true });
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