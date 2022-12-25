const { SlashCommandBuilder } = require('discord.js');
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
        console.log(subcommand);
        if (subcommand === 'user') {
            const user = interaction.options.getUser('target');
            if (!user) {
                await interaction.reply({ content: `This command was run by ${interaction.user.username}, who joined on ${interaction.member.joinedAt}.\nYour tag: ${interaction.user.tag}\nYour id: ${interaction.user.id}`, ephemeral: true });
                return;
            } else {
                await interaction.reply({ content: `${user.username}.\n${user.username} tag: ${user.tag}\n${user.username} id: ${user.id}`, ephemeral: true });
            }
        } else if (subcommand === 'server') {
            var servertimedata = convert(interaction.guild.id);
            await interaction.reply({ content: `Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}\nBuild on:${servertimedata[0]}\nServer time zone:${servertimedata[1]}\nCreated ${servertimedata[2]}`, ephemeral: true});
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    },
};

function convertIDtoUnix(id) {
    /* Note: id has to be str */
    var bin = (+id).toString(2);
    var unixbin = '';
    var unix = '';
    var m = 64 - bin.length;
    unixbin = bin.substring(0, 42-m);
    unix = parseInt(unixbin, 2) + 1420070400000;
    return unix;
}

function convert(id) {
    var unix = convertIDtoUnix(id.toString());
    var timestamp = moment.unix(unix/1000);
    var data = [timestamp.format('HH:mm:ss, DD-MM-YYYY'), 'Asia/Bangkok', timestamp.fromNow()];
    return data;
}