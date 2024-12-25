const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("pause")
        .setDescription("⏸️ Pause the current song."),
    
    async execute(interaction, client) {
        try {
            const player = client.manager.players.get(interaction.guild.id);

            if (!player) {
                return interaction.reply({
                    content: ":no_entry_sign: **There is no song playing right now!**",
                    ephemeral: true
                });
            }

            if (player.paused) {
                return interaction.reply({
                    content: ":no_entry_sign: **The song is already paused!**",
                    ephemeral: true
                });
            }

            player.pause(true);

            const embed = new EmbedBuilder()
                .setColor(client.config.embed)
                .setTitle(":pause_button: Song Paused")
                .setDescription(`**[${player.queue.current.title}](${player.queue.current.uri})** has been paused.`)
                .setFooter({ text: "Use /resume to resume the song! :notes:" });

            return interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            return interaction.reply(":exclamation: **An error occurred while trying to pause the song.**");
        }
    }
};