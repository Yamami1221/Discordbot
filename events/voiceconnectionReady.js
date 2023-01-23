const { VoiceConnectionStatus } = require('@discordjs/voice');

module.exports = {
    name: VoiceConnectionStatus.Ready,
    async execute(connection) {
        console.dir(connection);
        const guildcount = await connection.shard.fetchClientValues('guilds.cache.size');
        console.log(`Voice connection is ready for ${connection.user.username}#${connection.user.discriminator} in ${guildcount.reduce((acc, guildCount) => acc + guildCount, 0)} guilds`);
    },
};