const { VoiceConnectionStatus } = require('@discordjs/voice');

module.exports = {
	name: VoiceConnectionStatus.Ready,
	async execute(connection) {
		console.log(`Voice connection ready in ${connection}!`);
	},
};