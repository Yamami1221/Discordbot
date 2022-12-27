const { SlashCommandBuilder } = require('@discordjs/builders');
const { globalqueue } = require('../index.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skip the current song'),
    async execute(interaction) {
        skipSong(interaction);
        await interaction.reply({ content: 'This command is not available', ephemeral: true });
    },
};

async function skipSong(interaction) {
    var serverQueue = globalqueue.get(interaction.guild.id);
    if (!serverQueue) {
        return await interaction.reply({ content: 'There is no song that I could skip!', ephemeral: true });
    }
    serverQueue.connection.dispatcher.end();
}