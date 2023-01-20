require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('node:fs');

const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;


const commands = [];
const contextMenus = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const contextMenusFiles = fs.readdirSync('./contextMenus').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
}
for (const file of contextMenusFiles) {
    const contextMenu = require(`./contextMenus/${file}`);
    contextMenus.push(contextMenu.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(token);

// start deploying
(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        const data = await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
        );

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);

        console.log(`Started refreshing ${contextMenus.length} application context menus.`);

        const data2 = await rest.put(
            Routes.applicationCommands(clientId),
            { body: contextMenus },
        );

        console.log(`Successfully reloaded ${data2.length} application context menus.`);
    } catch (error) {
        console.error(error);
    }
})();