require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('node:fs');

const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;


const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const contextMenuFiles = fs.readdirSync('./contextMenus').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
}
for (const file of contextMenuFiles) {
    const command = require(`./contextMenus/${file}`);
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(token);

// start deploying
(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands and context munu commands.`);

        const data = await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
        );

        console.log(`Successfully reloaded ${data.length} application (/) commands and context munu commands.`);
    } catch (error) {
        console.error(error);
    }
})();