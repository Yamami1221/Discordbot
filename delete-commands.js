require('dotenv').config();
const { REST, Routes } = require('discord.js');

const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;
var commandId;

const rest = new REST({ version: '10' }).setToken(token);

// start deleting
(async () => {
	rest.delete(Routes.applicationCommand(clientId, commandId))
	.then(() => console.log('Successfully deleted application command'))
	.catch(console.error);
})();