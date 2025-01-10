const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("stop")
        .setDescription("⏹️ Stop the music and clear the queue."),
    
    async execute(interaction, client) {
        try {
            const player = client.manager.players.get(interaction.guild.id);

            if (!player) {
                return interaction.reply({
                    content: ":no_entry_sign: **There is no song playing right now!**",
                    ephemeral: true
                });
            }

            player.destroy();
            player.queue.clear();

            const embed = new EmbedBuilder()
                .setColor(client.config.embed)
                .setTitle(":stop_button: Music Stopped")
                .setDescription("The music has been stopped and the queue has been cleared.")
                .setFooter({ text: "Use /play to start playing music again! :notes:" });

            return interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            return interaction.reply(":exclamation: **An error occurred while trying to stop the music.**");
        }
    }
};

/**
 * Credits: Arpan | @arpandevv
 * Buy: https://feji.us/hx7je8
 */