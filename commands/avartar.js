const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const { globaldata } = require('../data/global');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Get a user\'s avatar')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user\'s avatar to show')),
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
        const user = interaction.options.getUser('user') || interaction.user;

        const embed = new EmbedBuilder()
            .setTitle(`**${user.username}'s Avatar**`)
            .setImage(user.displayAvatarURL({ size: 2048 }))
            .setFooter({ text:`Requested by ${interaction.user.username}`, iconURL:interaction.user.displayAvatarURL({ dynamic: true, size: 2048 }) })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    },
};