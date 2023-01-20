const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');

const { globalqueue } = require('../global.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('disable')
        .setDescription('disable text channel for music commands')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .setDMPermission(false),
    async execute(interaction) {
        await interaction.deferReply();
        if (interaction.member.permissions.has('MANAGE_CHANNELS')) {
            const serverqueue = globalqueue?.get(interaction.guild.id);
            if (!serverqueue) {
                const embed = new EmbedBuilder()
                    .setTitle('Disable')
                    .setDescription(`${interaction.guild.name} in not enabled for music commands`);
                await interaction.editReply({ embeds: [embed], ephemeral: true });
                return;
            } else {
                let enabled = false;
                for (let i = 0; i < serverqueue.textchannel.length; i++) {
                    if (serverqueue.textchannel[i].id === interaction.channel.id) {
                        enabled = true;
                    }
                }
                if (enabled === true) {
                    const textchannelforshowloc = serverqueue.textchannel.indexOf(interaction.channel);
                    serverqueue.textchannel.splice(textchannelforshowloc, 1);
                    let embed = new EmbedBuilder()
                        .setTitle('Disable')
                        .setDescription(`Disabled <#${interaction.channel.id}> for music commands`);
                    await interaction.editReply({ embeds: [embed] });
                    const data = JSON.stringify(globalqueue, replacer);
                    fs.writeFile('./data.json', data, err => {
                        if (err) {
                            console.log('There has been an error saving your configuration data.');
                            console.log(err.message);
                            embed = new EmbedBuilder()
                                .setTitle('Disable')
                                .setDescription('There has been an error saving your configuration data.');
                            interaction.editReply({ embeds: [embed] });
                            return;
                        }
                    });
                } else {
                    const embed = new EmbedBuilder()
                        .setTitle('Disable')
                        .setDescription(`<#${interaction.channel.id}> is already disabled`);
                    await interaction.editReply({ embeds: [embed], ephemeral: true });
                    return;
                }
            }
        } else {
            const embed = new EmbedBuilder()
                .setTitle('Disable')
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