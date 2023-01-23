const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');

const { globalqueue } = require('../global.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('enable')
        .setDescription('enable text channel for music commands')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .setDMPermission(false),
    async execute(interaction) {
        await interaction.deferReply();
        const serverQueue = globalqueue.get(interaction.guildId) || undefined;
        if (serverQueue?.veriChannel) {
            if (interaction.channel.id === serverQueue.veriChannel.id) {
                const embed = new EmbedBuilder()
                    .setTitle('Verification')
                    .setDescription('You cannot use this command in the verification channel');
                await interaction.editReply({ embeds: [embed], ephemeral: true });
                return;
            }
        }
        if (interaction.member.permissions.has('MANAGE_CHANNELS')) {
            const serverqueue = globalqueue?.get(interaction.guild.id);
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
                    veriChannel: null,
                    chatbotChannel: null,
                    chatbot: false,
                };
                queueconstruct.textchannel.push(interaction.channel);
                globalqueue.set(interaction.guild.id, queueconstruct);
                let embed = new EmbedBuilder()
                    .setTitle('Enable')
                    .setDescription(`Enabled ${interaction.guild.name} for music commands`);
                await interaction.editReply({ embeds: [embed] });
                embed = new EmbedBuilder()
                    .setTitle('Enable')
                    .setDescription(`Added <#${interaction.channel.id}> for music commands enabled list`);
                await interaction.followUp({ embeds: [embed] });
                const data = JSON.stringify(globalqueue, replacer);
                fs.writeFile('./data.json', data, err => {
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
                for (let i = 0; i < serverqueue.textchannel.length; i++) {
                    if (serverqueue.textchannel[i].id === interaction.channel.id) {
                        const embed = new EmbedBuilder()
                            .setTitle('Enable')
                            .setDescription(`<#${interaction.channel.id}> is already enabled`);
                        await interaction.editReply({ embeds: [embed], ephemeral: true });
                        enabled = true;
                        return;
                    }
                }
                if (enabled === false) {
                    serverqueue.textchannel.push(interaction.channel);
                    const textchannelforshowloc = serverqueue.textchannel.indexOf(interaction.channel);
                    const textchannelforshow = serverqueue.textchannel[textchannelforshowloc].id;
                    let embed = new EmbedBuilder()
                        .setTitle('Enable')
                        .setDescription(`Added <#${textchannelforshow}> for music commands enabled list`);
                    await interaction.editReply({ embeds: [embed] });
                    const data = JSON.stringify(globalqueue, replacer);
                    fs.writeFile('./data.json', data, err => {
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