const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("clearqueue")
        .setDescription("♻️ Clear the music queue."),
    
    async execute(interaction, client) {
        try {
            const player = client.manager.players.get(interaction.guild.id);

            if (!player) {
                return interaction.reply({
                    content: ":no_entry_sign: **There is no song playing right now!**",
                    ephemeral: true
                });
            }

            if (player.queue.size === 0) {
                return interaction.reply({
                    content: ":no_entry_sign: **The queue is already empty!**",
                    ephemeral: true
                });
            }

            player.queue.clear();

            const embed = new EmbedBuilder()
                .setColor(client.config.embed)
                .setTitle(":recycle: Queue Cleared")
                .setDescription("The music queue has been cleared.")
                .setFooter({ text: "Use /play to start playing music again! :notes:" });

            return interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            return interaction.reply(":exclamation: **An error occurred while trying to clear the queue.**");
        }
    }
};

/**
 * Credits: Arpan | @arpandevv
 * Buy: https://feji.us/hx7je8
 */