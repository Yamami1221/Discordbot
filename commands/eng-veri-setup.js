const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');

const { globaldata, role66map, roles66path } = require('../data/global');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('eng-veri-setup')
        .setDescription('Setup the verification system')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
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
                .setRequired(true)),
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
        role66map.set(interaction.guildId, data);
        fs.writeFileSync(roles66path, JSON.stringify([...globaldata]));
    },
};