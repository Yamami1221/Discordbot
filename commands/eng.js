const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');

const { globaldata, role66map, nickname66map, datapath, roles66path, nicknames66path } = require('../data/global');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('eng')
        .setDescription('Verify for the EC Discord server')
        .addSubcommand(subcommand =>
            subcommand
                .setName('setup')
                .setDescription('Setup the verification system')
                .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('The channel to use for verification')
                        .setRequired(true))
                .addRoleOption(option =>
                    option.setName('ent66')
                        .setDescription('The role of the Ent66')
                        .setRequired(true))
                .addRoleOption(option =>
                    option.setName('ent65')
                        .setDescription('The role of the Ent65')
                        .setRequired(true))
                .addRoleOption(option =>
                    option.setName('ent64')
                        .setDescription('The role of the Ent64')
                        .setRequired(true))
                .addRoleOption(option =>
                    option.setName('ent63')
                        .setDescription('The role of the Ent63')
                        .setRequired(true))
                .addRoleOption(option =>
                    option.setName('ent62')
                        .setDescription('The role of the Ent62')
                        .setRequired(true))
                .addRoleOption(option =>
                    option.setName('IE')
                        .setDescription('The role of IE')
                        .setRequired(true))
                .addRoleOption(option =>
                    option.setName('ME')
                        .setDescription('The role of ME')
                        .setRequired(true))
                .addRoleOption(option =>
                    option.setName('CE')
                        .setDescription('The role of CE')
                        .setRequired(true))
                .addRoleOption(option =>
                    option.setName('CPE')
                        .setDescription('The role of CPE')
                        .setRequired(true))
                .addRoleOption(option =>
                    option.setName('EE')
                        .setDescription('The role of EE')
                        .setRequired(true))
                .addRoleOption(option =>
                    option.setName('ENVI')
                        .setDescription('The role of ENVI')
                        .setRequired(true))
                .addRoleOption(option =>
                    option.setName('REAI')
                        .setDescription('The role of REAI')
                        .setRequired(true))
                .addRoleOption(option =>
                    option.setName('MNE')
                        .setDescription('The role of MNE')
                        .setRequired(true))
                .addRoleOption(option =>
                    option.setName('ISNE')
                        .setDescription('The role of ISNE')
                        .setRequired(true))
                .addRoleOption(option =>
                    option.setName('IGE')
                        .setDescription('The role of IGE')
                        .setRequired(true))
                .addRoleOption(option =>
                    option.setName('IEL')
                        .setDescription('The role of IEL')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('clear')
                .setDescription('Clear the verification system')
                .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles))
        .addSubcommand(subcommand =>
            subcommand
                .setName('verify')
                .setDescription('Verify yourself for the EC Discord server')
                .addStringOption(option =>
                    option.setName('nickname')
                        .setDescription('Your nickname')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('ent year')
                        .setDescription('Your Ent year')
                        .setAutocomplete(true)
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('major')
                        .setDescription('Your major')
                        .setAutocomplete(true)
                        .setRequired(true))),
    async autocomplete(interaction) {
        const focusedOption = interaction.options.getFocused(true);

        let choices;

        if (focusedOption.name === 'ent year') {
            choices = ['Ent66', 'Ent65', 'Ent64', 'Ent63', 'Ent62'];
        }

        if (focusedOption.name === 'Major') {
            choices = ['IE', 'ME', 'CE', 'CPE', 'EE', 'ENVI', 'REAI', 'MNE', 'ISNE', 'IGE', 'IEL'];
        }

        const filtered = choices.filter(choice => choice.startsWith(focusedOption.value));
        await interaction.respond(
            filtered.map(choice => ({ name: choice, value: choice })),
        );
    },
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        if (subcommand === 'setup') {
            setup(interaction);
        } else if (subcommand === 'clear') {
            clear(interaction);
        } else if (subcommand === 'verify') {
            verify(interaction);
        }
    },
};

async function setup(interaction) {
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
    if (!serverData) {
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
            chatbotChannel: [],
            timervar: null,
        };
        globaldata.set(interaction.guild.id, queueconstruct);
    }
    const serverdata = globaldata.get(interaction.guildId);
    if (serverdata.veriChannel) {
        const embed = new EmbedBuilder()
            .setTitle('Verification')
            .setDescription('Verification system has already been setup');
        return interaction.editReply({ embeds: [embed] });
    }
    const channel = interaction.options.getChannel('channel');
    const ent66 = interaction.options.getRole('ent66');
    const ent65 = interaction.options.getRole('ent65');
    const ent64 = interaction.options.getRole('ent64');
    const ent63 = interaction.options.getRole('ent63');
    const ent62 = interaction.options.getRole('ent62');
    const IE = interaction.options.getRole('IE');
    const ME = interaction.options.getRole('ME');
    const CE = interaction.options.getRole('CE');
    const CPE = interaction.options.getRole('CPE');
    const EE = interaction.options.getRole('EE');
    const ENVI = interaction.options.getRole('ENVI');
    const REAI = interaction.options.getRole('REAI');
    const MNE = interaction.options.getRole('MNE');
    const ISNE = interaction.options.getRole('ISNE');
    const IGE = interaction.options.getRole('IGE');
    const IEL = interaction.options.getRole('IEL');
    const embed = new EmbedBuilder()
        .setTitle('Verification')
        .setDescription('Verification system has been setup');
    await interaction.editReply({ embeds: [embed] });
    serverdata.veriChannel = channel;
    const data = {
        veriChannel: channel,
        ent66: ent66,
        ent65: ent65,
        ent64: ent64,
        ent63: ent63,
        ent62: ent62,
        IE: IE,
        ME: ME,
        CE: CE,
        CPE: CPE,
        EE: EE,
        ENVI: ENVI,
        REAI: REAI,
        MNE: MNE,
        ISNE: ISNE,
        IGE: IGE,
        IEL: IEL,
    };
    const premapToWrite = new Map([...globaldata]);
    const mapToWrite = new Map([...premapToWrite].map(([key, value]) => [key, Object.assign({}, value)]));
    mapToWrite.forEach((value) => {
        value.songs = [];
        value.connection = null;
        value.player = null;
        value.resource = null;
        value.timervar = null;
    });
    const objToWrite = Object.fromEntries(mapToWrite);
    const jsonToWrite = JSON.stringify(objToWrite, null, 4);
    fs.writeFile(datapath, jsonToWrite, err => {
        if (err) {
            console.log('There has been an error saving your configuration data.');
            console.log(err.message);
            const errembed = new EmbedBuilder()
                .setTitle('Enable')
                .setDescription('There has been an error saving your configuration data.');
            interaction.editReply({ embeds: [errembed] });
            return;
        }
    });
    role66map.set(interaction.guildId, data);
    const premapToWrite2 = new Map([...role66map]);
    const mapToWrite2 = new Map([...premapToWrite2].map(([key, value]) => [key, Object.assign({}, value)]));
    const objToWrite2 = Object.fromEntries(mapToWrite2);
    const jsonToWrite2 = JSON.stringify(objToWrite2, null, 4);
    fs.writeFileSync(roles66path, jsonToWrite2, err => {
        if (err) {
            console.log('There has been an error saving your configuration data.');
            console.log(err.message);
            const errembed = new EmbedBuilder()
                .setTitle('Enable')
                .setDescription('There has been an error saving your configuration data.');
            return interaction.editReply({ embeds: [errembed] });
        }
    });
}

async function clear(interaction) {
    const serverData = globaldata.get(interaction.guildId) || undefined;
    if (serverData?.veriChannel) {
        if (interaction.channel.id === serverData.veriChannel.id) {
            const embed = new EmbedBuilder()
                .setTitle('Verification')
                .setDescription('You cannot use this command in the verification channel');
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }
    }
    if (!serverData) {
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
            chatbotChannel: [],
            timervar: null,
        };
        globaldata.set(interaction.guild.id, queueconstruct);
    }
    const serverdata = globaldata.get(interaction.guildId);
    const alreadySetup = role66map.get(interaction.guildId);
    if (serverdata.veriChannel && alreadySetup) {
        serverdata.veriChannel = null;
        serverdata.veriRole = null;
        role66map.delete(interaction.guildId);
        fs.writeFileSync(roles66path, JSON.stringify([...role66map]));
        const embed = new EmbedBuilder()
            .setTitle('Verification')
            .setDescription('Verification system cleared');
        await interaction.reply({ embeds: [embed] });
    } else {
        const embed = new EmbedBuilder()
            .setTitle('Verification')
            .setDescription('Verification system is not setup');
        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
    const premapToWrite = new Map([...globaldata]);
    const mapToWrite = new Map([...premapToWrite].map(([key, value]) => [key, Object.assign({}, value)]));
    mapToWrite.forEach((value) => {
        value.songs = [];
        value.connection = null;
        value.player = null;
        value.resource = null;
        value.timervar = null;
    });
    const objToWrite = Object.fromEntries(mapToWrite);
    const jsonToWrite = JSON.stringify(objToWrite, null, 4);
    fs.writeFile(datapath, jsonToWrite, err => {
        if (err) {
            console.log('There has been an error saving your configuration data.');
            console.log(err.message);
            const errembed = new EmbedBuilder()
                .setTitle('Enable')
                .setDescription('There has been an error saving your configuration data.');
            interaction.editReply({ embeds: [errembed] });
            return;
        }
    });
    const premapToWrite2 = new Map([...role66map]);
    const mapToWrite2 = new Map([...premapToWrite2].map(([key, value]) => [key, Object.assign({}, value)]));
    const objToWrite2 = Object.fromEntries(mapToWrite2);
    const jsonToWrite2 = JSON.stringify(objToWrite2, null, 4);
    fs.writeFileSync(roles66path, jsonToWrite2, err => {
        if (err) {
            console.log('There has been an error saving your configuration data.');
            console.log(err.message);
            const errembed = new EmbedBuilder()
                .setTitle('Enable')
                .setDescription('There has been an error saving your configuration data.');
            return interaction.editReply({ embeds: [errembed] });
        }
    });
}

async function verify(interaction) {
    const serverData = globaldata.get(interaction.guildId) || undefined;
    if (serverData?.veriChannel) {
        if (interaction.channel.id !== serverData.veriChannel.id) {
            const embed = new EmbedBuilder()
                .setTitle('Verification')
                .setDescription('You can only use this command in the verification channel');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
    const engrolemap = role66map.get(interaction.guildId);
    if (engrolemap) {
        const nickname = interaction.options.getString('nickname');
        const entrole = interaction.options.getString('ent year');
        const majorrole = interaction.options.getString('major');
        nickname66map.set(interaction.user.id, nickname);
        if (entrole === 'Ent66') {
            interaction.member.roles.add(engrolemap.ent66.id);
        } else if (entrole === 'Ent65') {
            interaction.member.roles.add(engrolemap.ent65.id);
        } else if (entrole === 'Ent64') {
            interaction.member.roles.add(engrolemap.ent64.id);
        } else if (entrole === 'Ent63') {
            interaction.member.roles.add(engrolemap.ent63.id);
        } else if (entrole === 'Ent62') {
            interaction.member.roles.add(engrolemap.ent62.id);
        } else {
            const embed = new EmbedBuilder()
                .setTitle('Verification')
                .setDescription('You must select an ENT year');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
        if (majorrole === 'IE') {
            interaction.member.roles.add(engrolemap.IE.id);
        } else if (majorrole === 'ME') {
            interaction.member.roles.add(engrolemap.ME.id);
        } else if (majorrole === 'CE') {
            interaction.member.roles.add(engrolemap.CE.id);
        } else if (majorrole === 'CPE') {
            interaction.member.roles.add(engrolemap.CPE.id);
        } else if (majorrole === 'EE') {
            interaction.member.roles.add(engrolemap.EE.id);
        } else if (majorrole === 'ENVI') {
            interaction.member.roles.add(engrolemap.ENVI.id);
        } else if (majorrole === 'REAI') {
            interaction.member.roles.add(engrolemap.REAI.id);
        } else if (majorrole === 'MNE') {
            interaction.member.roles.add(engrolemap.MNE.id);
        } else if (majorrole === 'ISNE') {
            interaction.member.roles.add(engrolemap.ISNE.id);
        } else if (majorrole === 'IGE') {
            interaction.member.roles.add(engrolemap.IGE.id);
        } else if (majorrole === 'IEL') {
            interaction.member.roles.add(engrolemap.IEL.id);
        } else {
            const embed = new EmbedBuilder()
                .setTitle('Verification')
                .setDescription('You must select a major');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
        const embed = new EmbedBuilder()
            .setTitle('Verification')
            .setDescription(`Welcome to the server, ${nickname}!`)
            .addFields({ name: 'ENT Year', value: entrole, inline: true }, { name: 'Major', value: majorrole, inline: true })
            .setFooter({ text: interaction.user.tag, iconUrl: interaction.user.avatarURL() });
        await interaction.reply({ embeds: [embed] });
        const premapToWrite = new Map([...nickname66map]);
        const mapToWrite = new Map([...premapToWrite].map(([key, value]) => [key, Object.assign({}, value)]));
        const objToWrite = Object.fromEntries(mapToWrite);
        const jsonToWrite = JSON.stringify(objToWrite, null, 4);
        fs.writeFile(nicknames66path, jsonToWrite, err => {
            if (err) {
                console.log('There has been an error saving your configuration data.');
                console.log(err.message);
                const errembed = new EmbedBuilder()
                    .setTitle('Enable')
                    .setDescription('There has been an error saving your configuration data.');
                interaction.editReply({ embeds: [errembed] });
                return;
            }
        });
    } else {
        const embed = new EmbedBuilder()
            .setTitle('Verification')
            .setDescription('Verification system is not setup');
        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
}