const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

const { globaldata } = require('../data/global');

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
        await interaction.deferReply();
        const serverQueue = globaldata.get(interaction.guildId) || undefined;
        if (serverQueue?.veriChannel) {
            if (interaction.channel.id === serverQueue.veriChannel.id) {
                const embed = new EmbedBuilder()
                    .setTitle('Verification')
                    .setDescription('You cannot use this command in the verification channel');
                await interaction.editReply({ embeds: [embed], ephemeral: true });
                return;
            }
        }
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
