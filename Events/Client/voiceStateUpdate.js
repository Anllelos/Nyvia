const db = require("../../Schemas/247"); // Adjust the path as necessary

module.exports = {
    name: "ready",
    once: true,

    async execute(client) {
        // Check for all guilds with 24/7 mode enabled
        const guilds = await db.find({ mode: true });

        for (const guildData of guilds) {
            const guild = client.guilds.cache.get(guildData._id);
            if (!guild) continue; // Skip if the guild is not cached

            const voiceChannelId = guildData.voiceChannel;
            const voiceChannel = guild.channels.cache.get(voiceChannelId);

            if (voiceChannel) {
                // Create a player and connect to the voice channel
                const player = await client.manager.createPlayer({
                    guildId: guildData._id,
                    textId: guildData.textChannel,
                    voiceId: voiceChannelId,
                    volume: 100,
                    deaf: true,
                });
                console.log(`Rejoined voice channel: ${voiceChannel.name} in guild: ${guild.name}`);
            } else {
                console.log(`Voice channel not found for guild: ${guild.name}`);
            }
        }
    }
};