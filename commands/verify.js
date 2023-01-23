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
    if (interaction.member.permissions.has('ADMINISTRATOR') === false || interaction.member.permissions.has('MANAGE_GUILD') === false || interaction.member.permissions.has('MANAGE_ROLES') === false) {
        const embed = new EmbedBuilder()
            .setTitle('Enable')
            .setDescription('You do not have permission to use this command.');
        return interaction.editReply({ embeds: [embed], ephemeral: true });
    }
    let serverqueue = globalqueue.get(interaction.guild.id);
    if (!serverqueue) {
        await load(interaction);
    }
    serverqueue = globalqueue.get(interaction.guild.id);
    const role = interaction.options.getRole('role');
    const channel = interaction.options.getChannel('channel');
    if (serverqueue.veriRole) {
        const embed = new EmbedBuilder()
            .setTitle('Verify')
            .setDescription('There is already a verify role!');
        return interaction.editReply({ embeds: [embed] });
    }
    if (serverqueue.veriChannel) {
        const embed = new EmbedBuilder()
            .setTitle('Verify')
            .setDescription('There is already a verify channel!');
        return interaction.editReply({ embeds: [embed] });
    }
    serverqueue.veriRole = role;
    serverqueue.veriChannel = channel;
    const embed = new EmbedBuilder()
        .setTitle('Verify')
        .setDescription(`Seting up the verify command!\nRole: ${role}\nChannel: ${channel}`);
    await interaction.editReply({ embeds: [embed] });
    if (!serverqueue.playing) {
        const datatowrite = JSON.stringify(serverqueue, replacer);
        fs.writeFileSync('./data.json', datatowrite, err => {
            if (err) {
                console.log(err);
                console.log(err.message);
                const embed2 = new EmbedBuilder()
                    .setTitle('Verify')
                    .setDescription('There was an error saving the data!');
                return interaction.editReply({ embeds: [embed2] });
            }
        });
    }
}

async function remove(interaction) {
    await interaction.deferReply();
    if (interaction.member.permissions.has('ADMINISTRATOR') === false || interaction.member.permissions.has('MANAGE_GUILD') === false || interaction.member.permissions.has('MANAGE_ROLES') === false) {
        const embed = new EmbedBuilder()
            .setTitle('Enable')
            .setDescription('You do not have permission to use this command.');
        return interaction.editReply({ embeds: [embed], ephemeral: true });
    }
    let serverqueue = globalqueue.get(interaction.guild.id);
    if (!serverqueue) {
        await load(interaction);
    }
    serverqueue = globalqueue.get(interaction.guild.id);
    if (!serverqueue.veriRole) {
        const embed = new EmbedBuilder()
            .setTitle('Verify')
            .setDescription('There is no verify role!');
        return interaction.editReply({ embeds: [embed] });
    }
    serverqueue.veriRole = null;
    serverqueue.veriChannel = null;
    const embed = new EmbedBuilder()
        .setTitle('Verify')
        .setDescription('Removed the verify command!');
    await interaction.editReply({ embeds: [embed] });
}

async function verify(interaction) {
    await interaction.deferReply();
    let serverqueue = globalqueue.get(interaction.guild.id) || undefined;
    if (!serverqueue) {
        await load(interaction);
    }
    serverqueue = globalqueue.get(interaction.guild.id);
    const veriChannel = serverqueue.veriChannel;
    console.log(veriChannel);
    if (interaction.channel.id !== veriChannel?.id) {
        const embed = new EmbedBuilder()
            .setTitle('Verify')
            .setDescription('You can only verify in the verify channel!');
        return interaction.editReply({ embeds: [embed], ephemeral: true });
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
    const embed = new EmbedBuilder()
        .setTitle('Verify')
        .setDescription('You have been verified!');
    await interaction.editReply({ embeds: [embed] });
    const min = 1000;
    const max = 5000;
    const random = Math.floor(Math.random() * (max - min + 1)) + min;
    await sleep(random);
    await member.roles.add(verirole);
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

async function load(interaction) {
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
    const serverqueue = globalqueue.get(interaction.guild.id);
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

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}