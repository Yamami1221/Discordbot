const { SlashCommandBuilder } = require('@discordjs/builders');

var globalqueue = require('./play.js').globalqueue;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skip the current song'),
    async execute(interaction) {
        var serverQueue = globalqueue.get(interaction.guild.id);
        if (!interaction.member.voice.channel) {
            return interaction.reply({ content: 'You have to be in a voice channel to stop the music!', ephemeral: true }); 
        }
        if (!serverQueue) {
            return interaction.reply({ content: 'There is no song that I could skip!', ephemeral: true });
        }
        serverQueue.connection.dispatcher.end();
        await interaction.reply({ content: 'Skipped the song!', ephemeral: true });
    },
};

