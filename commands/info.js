const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { stripIndents } = require('common-tags');
const moment = require('moment');

const { globaldata } = require('../data/global');

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
        const subcommand = interaction.options.getSubcommand();
        if (subcommand === 'user') {
            const user = interaction.options.getUser('target');
            if (!user) {
                const member = interaction.guild.members.cache.get(interaction.user.id) || interaction.user;

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
                    )
                    .setFooter({ text:`Requested by ${interaction.user.username}#${interaction.user.discriminator}`, iconURL:interaction.user.displayAvatarURL({ dynamic: true, size: 2048 }) })
                    .setTimestamp();
                await interaction.editReply({ embeds: [embed], ephemeral: true });
            } else {
                const member = interaction.guild.members.cache.get(user.id) || user;

                const embed = new EmbedBuilder()
                    .setTitle(`**${member.user.username}#${member.user.discriminator}**`)
                    .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 2048 }))
                    .addFields(
                        {
                            name: '👤 Account Info',
                            value: stripIndents`
                            **ID:** ${member.user.id}
                            **Bot:** ${member.user.bot ? 'Yes' : 'No'}
                            **Created:** <t:${Math.floor(member.user.createdTimestamp / 1000)}:d>`,
                            inline: true,
                        },
                        {
                            name: '📋 Member Info',
                            value: stripIndents`
                            **Joined Server:** <t:${Math.floor(member.joinedTimestamp / 1000)}:R>
                            **Nickname:** ${member.nickname || 'None'}
                            **Hoist Role:** ${member.roles.hoist ? member.roles.hoist.name : 'None'}`,
                            inline: true,
                        },
                        {
                            name: `📝 Roles [${member.roles.cache.size - 1}]`,
                            value: member.roles.cache.size ? member.roles.cache.map(roles => `**${roles}**`).slice(0, -1).join(' ') : 'None',
                            inline: false,
                        },
                    )
                    .setFooter({ text:`Requested by ${interaction.user.username}`, iconURL:interaction.user.displayAvatarURL({ dynamic: true, size: 2048 }) })
                    .setTimestamp();
                await interaction.editReply({ embeds: [embed], ephemeral: true });
            }
        } else if (subcommand === 'server') {
            const fetchedMembers = await interaction.guild.members.fetch({ withPresences: true });
            const totalOnline = fetchedMembers.filter(member => member.presence?.status === 'online');
            const servertimedata = convert(interaction.guild.id);
            const embed = new EmbedBuilder()
                .setTitle('Info')
                .setDescription('Info about the server')
                .setThumbnail(interaction.guild.iconURL({ dynamic: true, size: 2048 }))
                .addFields(
                    {
                        name: 'Server Info', value: stripIndents`
                        **Server name:** ${interaction.guild.name}
                        **Server ID:** ${interaction.guild.id}
                        **Server owner:** ${interaction.guild.members.cache.get(interaction.guild.ownerId).user.username}#${interaction.guild.members.cache.get(interaction.guild.ownerId).user.discriminator}
                        **Total members:** ${interaction.guild.memberCount}`,
                        inline: true,
                    },
                )
                .addFields(
                    {
                        name: 'Server Info', value: stripIndents`
                        **Members online:** ${totalOnline.size}
                        **Build on:** ${servertimedata[0]}
                        **Server time zone:** ${servertimedata[1]}
                        **Created:** ${servertimedata[2]}`,
                        inline: true,
                    },
                )
                .setFooter({ text:`Requested by ${interaction.user.username}#${interaction.user.discriminator}`, iconURL:interaction.user.displayAvatarURL({ dynamic: true, size: 2048 }) })
                .setTimestamp();
            await interaction.editReply({ embeds: [embed], ephemeral: true });
        }
    },
};

function convertIDtoUnix(id) {
    /* Note: id has to be str */
    const bin = (+id).toString(2);
    let unixbin = '';
    let unix = '';
    const m = 64 - bin.length;
    unixbin = bin.substring(0, 42 - m);
    unix = parseInt(unixbin, 2) + 1420070400000;
    return unix;
}

function convert(id) {
    const unix = convertIDtoUnix(id.toString());
    const timestamp = moment.unix(unix / 1000);
    const data = [timestamp.format('HH:mm:ss, DD-MM-YYYY'), 'Asia/Bangkok', timestamp.fromNow()];
    return data;
}