const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const moment = require('moment');

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
                const embed = new EmbedBuilder()
                    .setTitle('Info')
                    .setDescription('Info about a user')
                    .addField('Username', interaction.user.username)
                    .addField('Tag', interaction.user.tag)
                    .addField('ID', interaction.user.id)
                    .addField('Joined at', moment(interaction.member.joinedAt).format('MMMM Do YYYY, h:mm:ss a'))
                    .setTimestamp();
                await interaction.reply({ embeds: [embed], ephemeral: true });
            } else {
                const embed = new EmbedBuilder()
                    .setTitle('Info')
                    .setDescription('Info about a user')
                    .addField('Username', user.username)
                    .addField('Tag', user.tag)
                    .addField('ID', user.id)
                    .setTimestamp();
                await interaction.reply({ embeds: [embed], ephemeral: true });
            }
        } else if (subcommand === 'server') {
            const fetchedMembers = interaction.guild.members.fetch({ withPresences: true });
            const totalOnline = fetchedMembers.filter(member => member.presence?.status === 'online');
            const servertimedata = convert(interaction.guild.id);
            const embed = new EmbedBuilder()
                .setTitle('Info')
                .setDescription('Info about the server')
                .addField('Server name', interaction.guild.name)
                .addField('Total members', interaction.guild.memberCount)
                .addField('Members online', totalOnline.size)
                .addField('Build on', servertimedata[0])
                .addField('Server time zone', servertimedata[1])
                .addField('Created', servertimedata[2])
                .setTimestamp();
            await interaction.reply({ embeds: [embed], ephemeral: true });
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