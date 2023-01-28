const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');

const { globaldata } = require('../data/global');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('enable')
        .setDescription('enable text channel for music commands')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
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
        if (interaction.member.permissions.has('MANAGE_CHANNELS')) {
            const serverdata = globaldata?.get(interaction.guild.id);
            if (!serverdata) {
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
                };
                queueconstruct.textchannel.push(interaction.channel);
                globaldata.set(interaction.guild.id, queueconstruct);
                let embed = new EmbedBuilder()
                    .setTitle('Enable')
                    .setDescription(`Enabled ${interaction.guild.name} for music commands`);
                await interaction.editReply({ embeds: [embed] });
                embed = new EmbedBuilder()
                    .setTitle('Enable')
                    .setDescription(`Added <#${interaction.channel.id}> for music commands enabled list`);
                await interaction.followUp({ embeds: [embed] });
                const datatowrite = JSON.stringify(globaldata, replacer);
                fs.writeFile('./data/data.json', datatowrite, err => {
                    if (err) {
                        console.log('There has been an error saving your configuration data.');
                        console.log(err.message);
                        embed = new EmbedBuilder()
                            .setTitle('Enable')
                            .setDescription('There has been an error saving your configuration data.');
                        interaction.editReply({ embeds: [embed] });
                        return;
                    }
                });
            } else {
                let enabled = false;
                for (let i = 0; i < serverdata.textchannel.length; i++) {
                    if (serverdata.textchannel[i].id === interaction.channel.id) {
                        const embed = new EmbedBuilder()
                            .setTitle('Enable')
                            .setDescription(`<#${interaction.channel.id}> is already enabled`);
                        await interaction.editReply({ embeds: [embed], ephemeral: true });
                        enabled = true;
                        return;
                    }
                }
                if (enabled === false) {
                    serverdata.textchannel.push(interaction.channel);
                    const textchannelforshowloc = serverdata.textchannel.indexOf(interaction.channel);
                    const textchannelforshow = serverdata.textchannel[textchannelforshowloc].id;
                    let embed = new EmbedBuilder()
                        .setTitle('Enable')
                        .setDescription(`Added <#${textchannelforshow}> for music commands enabled list`);
                    await interaction.editReply({ embeds: [embed] });
                    const datatowrite = JSON.stringify(globaldata, replacer);
                    fs.writeFile('./data/data.json', datatowrite, err => {
                        if (err) {
                            console.log('There has been an error saving your configuration data.');
                            console.log(err.message);
                            embed = new EmbedBuilder()
                                .setTitle('Enable')
                                .setDescription('There has been an error saving your configuration data.');
                            interaction.editReply({ embeds: [embed] });
                            return;
                        }
                    });
                }
            }
        } else {
            const embed = new EmbedBuilder()
                .setTitle('Enable')
                .setDescription('You do not have permission to use this command');
            await interaction.editReply({ embeds: [embed], ephemeral: true });
        }
    },
};

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