const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("resume")
        .setDescription("▶️ Resume the paused song."),
    
    async execute(interaction, client) {
        try {
            const player = client.manager.players.get(interaction.guild.id);

            if (!player) {
                return interaction.reply({
                    content: ":no_entry_sign: **There is no song playing right now!**",
                    ephemeral: true
                });
            }

            if (!player.paused) {
                return interaction.reply({
                    content: ":no_entry_sign: **The song is not paused!**",
                    ephemeral: true
                });
            }

            player.pause(false);

            const embed = new EmbedBuilder()
                .setColor(client.config.embed)
                .setTitle(":play_button: Song Resumed")
                .setDescription(`**[${player.queue.current.title}](${player.queue.current.uri})** has been resumed.`)
                .setFooter({ text: "Enjoy the music! :notes:" });

            return interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            return interaction.reply(":exclamation: **An error occurred while trying to resume the song.**");
        }
    }
};

/**
 * Credits: Arpan | @arpandevv
 * Buy: https://feji.us/hx7je8
 */