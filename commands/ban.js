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
        await interaction.deferReply();
        const target = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') ?? 'No reason provided';

        if (interaction.member.permissions.has('BAN_MEMBERS') === false) {
            return interaction.editReply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }
        if (target.id === interaction.user.id) {
            return interaction.editReply({ content: 'You cannot ban yourself.', ephemeral: true });
        }
        const embed = new EmbedBuilder()
            .setTitle('Ban')
            .setDescription(`${target.username} have been banned from ${interaction.guild.name} for reason: ${reason}`)
            .setFooter({ text:`Requested by ${interaction.user.username}`, iconURL:interaction.user.displayAvatarURL({ dynamic: true, size: 2048 }) })
            .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
        await interaction.guild.members.ban(target);
    },
};