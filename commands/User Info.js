const { ContextMenuCommandBuilder, ApplicationCommandType, EmbedBuilder } = require('discord.js');
const { stripIndents } = require('common-tags');

const { globaldata } = require('../data/global');

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('User Info')
        .setType(ApplicationCommandType.User),
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
        const member = interaction.guild.members.cache.get(interaction.targetId) || interaction.member;

        const embed = new EmbedBuilder()
            .setTitle(`**${member.user.username}#${member.user.discriminator}**`)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 2048 }))
            .addFields(
                {
                    name: '👤 Account Info',
                    value: stripIndents`
                    **ID:** ${member.user.id}
                    **Bot:** ${member.user.bot ? 'Yes' : 'No'}
                    **Created:** <t:${Math.floor(member.user.createdTimestamp / 1000)}:d>
                    `,
                    inline: true,
                },
                {
                    name: '📋 Member Info',
                    value: stripIndents`
                    **Joined Server:** <t:${Math.floor(member.joinedTimestamp / 1000)}:R>
                    **Nickname:** ${member.nickname || 'None'}
                    **Hoist Role:** ${member.roles.hoist ? member.roles.hoist.name : 'None'}
                    `,
                    inline: true,
                },
                {
                    name: `📝 Roles [${member.roles.cache.size - 1}]`,
                    value: member.roles.cache.size ? member.roles.cache.map(roles => `**${roles}**`).slice(0, -1).join(' ') : 'None',
                    inline: false,
                },
            );
        await interaction.editReply({ embeds: [embed], ephemeral: true });
    },
};
