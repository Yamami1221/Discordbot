const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
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
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('The channel to verify in')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('remove')
                .setDescription('Remove the verify command'))
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
    if (!interaction.member.permissions.has('MANAGE_GUILD')) {
        const embed = new EmbedBuilder()
            .setTitle('Verify Setup')
            .setDescription('You do not have permission to use this command')
            .setTimestamp();
        interaction.editReply({ embeds: [embed] });
        return;
    }
    const role = interaction.options.getRole('role');
    const channel = interaction.options.getChannel('channel');
    const serverQueue = globalqueue.get(interaction.guild.id);
    if (!serverQueue) {
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
            veriChannel: null,
            chatbotChannel: null,
            chatbot: false,
        };
        globalqueue.set(interaction.guild.id, queueconstruct);
    }
    const serverqueue = globalqueue.get(interaction.guild.id);
    if (serverqueue.veriRole || serverqueue.veriChannel) {
        const embed = new EmbedBuilder()
            .setTitle('Verify Setup')
            .setDescription('The verify command has already been setup')
            .setTimestamp();
        interaction.editReply({ embeds: [embed] });
        return;
    }
    serverqueue.veriRole = role;
    serverqueue.veriChannel = channel;
    const embed = new EmbedBuilder()
        .setTitle('Verify Setup')
        .setDescription(`The verify command has been setup in <#${channel.id}> with the role <@&${role.id}>`)
        .setTimestamp();
    interaction.editReply({ embeds: [embed] });
    if (!serverqueue.playing) {
        const data = JSON.stringify(globalqueue, replacer);
        fs.writeFileSync('./data.json', data, err => {
            if (err) {
                console.error(err);
                console.log(err.message);
                const emerr = new EmbedBuilder()
                    .setTitle('Verify Setup')
                    .setDescription('There was an error saving the data')
                    .setTimestamp();
                interaction.editReply({ embeds: [emerr] });
            }
        });
    }
}

async function remove(interaction) {
    await interaction.deferReply();
    if (!interaction.member.permissions.has('MANAGE_GUILD')) {
        const embed = new EmbedBuilder()
            .setTitle('Verify Remove')
            .setDescription('You do not have permission to use this command')
            .setTimestamp();
        interaction.editReply({ embeds: [embed] });
        return;
    }
    const serverQueue = globalqueue.get(interaction.guild.id);
    if (!serverQueue) {
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
            veriChannel: null,
            chatbotChannel: null,
            chatbot: false,
        };
        globalqueue.set(interaction.guild.id, queueconstruct);
    }
    const serverqueue = globalqueue.get(interaction.guild.id);
    if (!serverqueue.veriRole || !serverqueue.veriChannel) {
        const embed = new EmbedBuilder()
            .setTitle('Verify Remove')
            .setDescription('The verify command has not been setup')
            .setTimestamp();
        interaction.editReply({ embeds: [embed] });
        return;
    }
    serverqueue.veriRole = null;
    serverqueue.veriChannel = null;
    const embed = new EmbedBuilder()
        .setTitle('Verify Remove')
        .setDescription('The verify command has been removed')
        .setTimestamp();
    interaction.editReply({ embeds: [embed] });
    if (!serverqueue.playing) {
        const data = JSON.stringify(globalqueue, replacer);
        fs.writeFileSync('./data.json', data, err => {
            if (err) {
                console.error(err);
                console.log(err.message);
                const emerr = new EmbedBuilder()
                    .setTitle('Verify Remove')
                    .setDescription('There was an error saving the data')
                    .setTimestamp();
                interaction.editReply({ embeds: [emerr] });
            }
        });
    }
}

async function verify(interaction) {
    await interaction.deferReply();
    const serverQueue = globalqueue.get(interaction.guild.id);
    if (!serverQueue) {
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
            veriChannel: null,
            chatbotChannel: null,
            chatbot: false,
        };
        globalqueue.set(interaction.guild.id, queueconstruct);
    }
    const serverqueue = globalqueue.get(interaction.guild.id);
    if (serverqueue.veriRole === null || serverqueue.veriChannel === null) {
        const embed = new EmbedBuilder()
            .setTitle('Verify')
            .setDescription('The verify command has not been setup')
            .setTimestamp();
        interaction.editReply({ embeds: [embed] });
    } else {
        if (interaction.channel.id === serverqueue.veriChannel.id) {
            const member = interaction.member;
            const embed = new EmbedBuilder()
                .setTitle('Verify')
                .setDescription(`Verified successfully\nWelcome <@${interaction.member.id}>`)
                .setTimestamp();
            interaction.editReply({ embeds: [embed] });
            const min = 1000;
            const max = 5000;
            const random = Math.floor(Math.random() * (max - min + 1)) + min;
            await sleep(random);
            member.roles.add(serverqueue.veriRole);
        } else {
            const embed = new EmbedBuilder()
                .setTitle('Verify')
                .setDescription('You can only verify in verify channel!')
                .setTimestamp();
            interaction.editReply({ embeds: [embed] });
        }
    }
}


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

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}