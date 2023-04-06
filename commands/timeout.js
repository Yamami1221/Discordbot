const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

const { globaldata } = require('../data/global');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Select a member and timeout them.')
        .addUserOption(option =>
            option
                .setName('target')
                .setDescription('The member to timeout')
                .setRequired(true))
        .addIntegerOption(option =>
            option
                .setName('time')
                .setDescription('The time to timeout(in minutes)')
                .min_value(1)
                .max_value(43200)
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('The reason for timeout'))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .setDMPermission(false),
    async execute(interaction) {
        await interaction.deferReply();
        const serverData = globaldata.get(interaction.guildId) || undefined;
        if (serverData?.veriChannel) {
            if (interaction.channel.id === serverData.veriChannel.id) {
                const embed = new EmbedBuilder()
                    .setTitle('Verification')
                    .setDescription('You cannot use this command in the verification channel');
                await interaction.editReply({ embeds: [embed], ephemeral: true });
                return;
            }
        }
        const target = interaction.options.getUser('target');
        const time = interaction.options.getInteger('time');
        const reason = interaction.options.getString('reason') ?? 'No reason provided';

        if (interaction.member.permissions.has('KICK_MEMBERS') === false) {
            return interaction.editReply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }
        if (target.id === interaction.user.id) {
            return interaction.editReply({ content: 'You cannot timeout yourself.', ephemeral: true });
        }
        const embed = new EmbedBuilder()
            .setTitle('Timeout')
            .setDescription(`${target.username} have been timeout from ${interaction.guild.name} for \nreason: ${reason}`)
            .setFooter({ text:`Requested by ${interaction.user.username}`, iconURL:interaction.user.displayAvatarURL({ dynamic: true, size: 2048 }) })
            .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
        target.timeout(60_000 * time);
    },
};