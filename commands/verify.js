const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');

const { globalqueue } = require('../global.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('verify')
        .setDescription('Verify yourself to gain access to the server')
        .setDMPermission(false)
        .addSubcommand(subcommand =>
            subcommand.setName('setup')
                .setDescription('Setup the verify command')
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('The role to give to verified users')
                        .setRequired(true))
                .setDefaultmemberpermissions(PermissionFlagsBits.ManageRoles))
        .addSubcommand(subcommand =>
            subcommand.setName('remove')
                .setDescription('Remove the verify command')
                .setDefaultmemberpermissions(PermissionFlagsBits.ManageRoles))
        .addSubcommand(subcommand =>
            subcommand.setName('verify')
                .setDescription('Verify yourself')),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        if (subcommand === 'setup') {
            setup(interaction);
        }
        else if (subcommand === 'remove') {
            remove(interaction);
        }
        else if (subcommand === 'verify') {
            verify(interaction);
        }
    },
};

async function setup(interaction) {
    await interaction.deferReply();
    const serverqueue = globalqueue.get(interaction.guild.id);
    if (!serverqueue) {
        const queueconstruct = {
            textchannel: [],
            voicechannel: null,
            connection: null,
            songs: [],
            volume: 50,
            player: null,
            resource: null,
            playing: false,
            loop: false,
            shuffle: false,
            autoplay: false,
            sound8d: false,
            bassboost: false,
            nightcore: false,
            veriRole: null,
        };
        globalqueue.set(interaction.guild.id, queueconstruct);
        if (!serverqueue.playing) {
            const data = JSON.stringify(globalqueue, replacer);
            fs.writeFile('./data.json', data, err => {
                if (err) {
                    console.log('There has been an error saving your configuration data.');
                    console.log(err.message);
                    const embed = new EmbedBuilder()
                        .setTitle('Enable')
                        .setDescription('There has been an error saving your configuration data.');
                    interaction.editReply({ embeds: [embed] });
                    return;
                }
            });
        }
    }
    const role = interaction.options.getRole('role');
    if (serverqueue.veriRole) {
        const embed = new EmbedBuilder()
            .setTitle('Verify')
            .setDescription('There is already a verify role!');
        await interaction.editReply({ embeds: [embed] });
    }
    serverqueue.veriRole = role;
    const embed = new EmbedBuilder()
        .setTitle('Verify')
        .setDescription(`Set the verify role to ${role}!`);
    await interaction.editReply({ embeds: [embed] });
}

async function remove(interaction) {
    await interaction.deferReply();
    const serverqueue = globalqueue.get(interaction.guild.id);
    if (!serverqueue) {
        const queueconstruct = {
            textchannel: [],
            voicechannel: null,
            connection: null,
            songs: [],
            volume: 50,
            player: null,
            resource: null,
            playing: false,
            loop: false,
            shuffle: false,
            autoplay: false,
            sound8d: false,
            bassboost: false,
            nightcore: false,
            veriRole: null,
        };
        globalqueue.set(interaction.guild.id, queueconstruct);
        if (!serverqueue.playing) {
            const data = JSON.stringify(globalqueue, replacer);
            fs.writeFile('./data.json', data, err => {
                if (err) {
                    console.log('There has been an error saving your configuration data.');
                    console.log(err.message);
                    const embed = new EmbedBuilder()
                        .setTitle('Enable')
                        .setDescription('There has been an error saving your configuration data.');
                    interaction.editReply({ embeds: [embed] });
                    return;
                }
            });
        }
    }
    if (!serverqueue.veriRole) {
        const embed = new EmbedBuilder()
            .setTitle('Verify')
            .setDescription('There is no verify role!');
        await interaction.editReply({ embeds: [embed] });
    }
    serverqueue.veriRole = null;
    const embed = new EmbedBuilder()
        .setTitle('Verify')
        .setDescription('Removed the verify command!');
    await interaction.editReply({ embeds: [embed] });
}

async function verify(interaction) {
    await interaction.deferReply();
    const serverqueue = globalqueue.get(interaction.guild.id);
    if (!serverqueue) {
        const queueconstruct = {
            textchannel: [],
            voicechannel: null,
            connection: null,
            songs: [],
            volume: 50,
            player: null,
            resource: null,
            playing: false,
            loop: false,
            shuffle: false,
            autoplay: false,
            sound8d: false,
            bassboost: false,
            nightcore: false,
            veriRole: null,
        };
        globalqueue.set(interaction.guild.id, queueconstruct);
        if (!serverqueue.playing) {
            const data = JSON.stringify(globalqueue, replacer);
            fs.writeFile('./data.json', data, err => {
                if (err) {
                    console.log('There has been an error saving your configuration data.');
                    console.log(err.message);
                    const embed = new EmbedBuilder()
                        .setTitle('Enable')
                        .setDescription('There has been an error saving your configuration data.');
                    interaction.editReply({ embeds: [embed] });
                    return;
                }
            });
        }
    }
    const verirole = serverqueue.veriRole;
    if (!verirole) {
        const embed = new EmbedBuilder()
            .setTitle('Verify')
            .setDescription('There is no verify role!\nPlease set one up with /verify setup <role>');
        return interaction.editReply({ embeds: [embed], ephemeral: true });
    }
    const member = interaction.member;
    if (member.roles.cache.has(verirole.id)) {
        const embed = new EmbedBuilder()
            .setTitle('Verify')
            .setDescription('You are already verified!');
        return interaction.editReply({ embeds: [embed], ephemeral: true });
    }
    await member.roles.add(verirole);
    const embed = new EmbedBuilder()
        .setTitle('Verify')
        .setDescription('You have been verified!');
    await interaction.editReply({ embeds: [embed] });
}


/*
        await interaction.deferReply();
        const verirole = interaction.guild.roles.cache.find(role => role.name === 'Verified');
        const member = interaction.member;
        if (member.roles.cache.has(verirole.id)) {
            const embed = new EmbedBuilder()
                .setTitle('Verify')
                .setDescription('You are already verified!');
            return interaction.editReply({ embeds: [embed], ephemeral: true });
        }
        await member.roles.add(verirole);
        const embed = new EmbedBuilder()
            .setTitle('Verify')
            .setDescription('You have been verified!');
        await interaction.editReply({ embeds: [embed] });
*/

function replacer(key, value) {
    if (value instanceof Map) {
        return {
            dataType: 'Map',
            value: Array.from(value.entries()), // or with spread: value: [...value]
        };
    } else {
        return value;
    }
}