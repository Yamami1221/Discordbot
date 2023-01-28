const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const { globaldata } = require('../data/global');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Creates a poll.')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to send the poll in')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('question')
                .setDescription('The question to ask')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('options')
                .setDescription('The options to choose from (separate with commas)(limit 5)')
                .setRequired(true))
        .addBooleanOption(option =>
            option.setName('anonymous')
                .setDescription('Whether or not to hide the poll creator')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('time')
                .setDescription('The time in seconds to keep the poll open(60 seconds by default)')
                .setRequired(false)),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
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
        const channel = interaction.options.getChannel('channel');
        const question = interaction.options.getString('question');
        const options = interaction.options.getString('options').split(',');
        options.length = 5;
        const embed = new EmbedBuilder()
            .setTitle(`Poll **"${question}"**`)
            .setTimestamp();
        for (let i = 0; i < options.length; i++) {
            embed.addFields({ name:`choice ${options[i]}`, value:'0' });
        }
        if (!interaction.options.getBoolean('anonymous')) embed.setFooter({ text:`Poll created by ${interaction.user.username}`, iconURL:interaction.user.displayAvatarURL({ dynamic: true, size: 2048 }) });
        const row = new ActionRowBuilder();
        for (let i = 0; i < options.length; i++) {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`poll_${i}`)
                    .setLabel(options[i])
                    .setStyle(ButtonStyle.Primary),
            );
        }
        const replyy = new EmbedBuilder()
            .setTitle('Poll created!')
            .setDescription(`Poll created in ${channel}!`)
            .setTimestamp();
        await interaction.editReply({ embeds: [replyy], ephemeral: true });
        const msg = await channel.send({ embeds: [embed], components: [row] });
        const filter = i => i.customId.startsWith('poll_');
        const collector = msg.createMessageComponentCollector({ filter, time: interaction.options.getInteger('time') * 1000 || 60000 });
        collector.on('collect', async i => {
            await i.deferUpdate();
            const embeded = msg.embeds[0];
            const option = options[parseInt(i.customId.split('_')[1])];
            const field = embeded.fields.find(f => f.name === `choice ${option}`);
            if (field) {
                field.value = parseInt(field.value) + 1;
            } else {
                embeded.addFields({ name:`choice ${option}`, value:'1' });
            }
            await msg.edit({ embeds: [embeded] });
        });
        collector.on('end', async collected => {
            console.log(`Collected ${collected.size} items`);
            const embededed = msg.embeds[0];
            embededed.data.title = `Poll **"${embed.data.title}"** (Ended)`;
            await msg.edit({ embeds: [embededed], components: [] });
        });
    },
};