const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Select a member and ban them.')
        .addUserOption(option =>
            option
                .setName('target')
                .setDescription('The member to ban')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('The reason for banning'))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .setDMPermission(false),
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') ?? 'No reason provided';

        if (interaction.member.permissions.has('BAN_MEMBERS') === false) {
            return interaction.reply('You do not have permission to use this command.');
        }
        if (target.id === interaction.user.id) {
            return interaction.reply('You cannot ban yourself.');
        }
        const embed = new EmbedBuilder()
            .setTitle('Ban')
            .setDescription(`${target.username} have been banned from ${interaction.guild.name} for reason: ${reason}`);
        await interaction.reply({ embeds: [embed] });
        await interaction.guild.members.ban(target);
    },
};