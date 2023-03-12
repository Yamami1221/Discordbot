const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');

const { globaldata } = require('../data/global');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('disable')
        .setDescription('disable text channel for music commands')
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
                const embed = new EmbedBuilder()
                    .setTitle('Disable')
                    .setDescription(`${interaction.guild.name} in not enabled for music commands`);
                await interaction.editReply({ embeds: [embed], ephemeral: true });
                return;
            } else {
                const enabled = serverdata.textchannel.find((channel) => channel.id === interaction.channel.id);
                if (enabled) {
                    const textchannelforshowloc = serverdata.textchannel.indexOf(interaction.channel);
                    serverdata.textchannel.splice(textchannelforshowloc, 1);
                    let embed = new EmbedBuilder()
                        .setTitle('Disable')
                        .setDescription(`Disabled <#${interaction.channel.id}> for music commands`);
                    await interaction.editReply({ embeds: [embed] });
                    const datatowrite = JSON.stringify(globaldata, replacer);
                    fs.writeFile('./data/data.json', datatowrite, err => {
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