const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Get info about a user or a server!')
        .addSubcommand(subcommand =>
            subcommand
                .setName('user')
                .setDescription('Info about a user')
                .addUserOption(option =>
                    option.setName('target')
                        .setDescription('The user to get info from')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('server')
                .setDescription('Info about the server')),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        if (subcommand === 'user') {
            const user = interaction.options.getUser('target');
            if (!user) {
                await interaction.reply({ content: `This command was run by ${interaction.user.username}, who joined on ${interaction.member.joinedAt}.\nYour tag: ${interaction.user.tag}\nYour id: ${interaction.user.id}`, ephemeral: true });
                return;
            } else {
                await interaction.reply({ content: `${user.username} joined on ${user.member.joinedAt}.\n${user.username} tag: ${user.tag}\n${user.username} id: ${user.id}`, ephemeral: true });
            }
        } else if (subcommand === 'server') {
            await interaction.reply(`Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`);
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    },
};