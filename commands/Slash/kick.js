const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Select a member and kick them.')
        .addUserOption(option =>
            option
                .setName('target')
                .setDescription('The member to kick')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('The reason for banning'))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers | PermissionFlagsBits.KickMembers)
        .setDMPermission(false),
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') ?? 'No reason provided';

        if (interaction.member.permissions.has('KICK_MEMBERS') === false) {
            return interaction.reply('You do not have permission to use this command.');
        }
        if (target.id === interaction.user.id) {
            return interaction.reply('You cannot kick yourself.');
        }
        await interaction.reply(`Kicking ${target.username} for reason: ${reason}`);
        await interaction.guild.members.kick(target);
    },
};
