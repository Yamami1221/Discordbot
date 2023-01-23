const { VoiceConnectionStatus, entersState } = require('@discordjs/voice');

module.exports = {
    name: VoiceConnectionStatus.Disconnected,
    async execute(connection) {
        try {
            await Promise.race([
                entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
            ]);
        } catch (error) {
            connection.destroy();
        }
    },
};