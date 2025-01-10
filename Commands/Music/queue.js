const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("queue")
        .setDescription("View the music queue."),
    
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
                    content: ":no_entry_sign: **The queue is empty!**",
                    ephemeral: true
                });
            }

            const queue = player.queue.map((track, index) => {
                return `**${index + 1}.** [${track.title}](${track.uri}) - **${track.author}**`;
            }).join("\n");

            const embed = new EmbedBuilder()
                .setColor(client.config.embed)
                .setTitle(":list: Music Queue")
                .setDescription(queue)
                .setFooter({ text: `Total tracks: ${player.queue.size}` });

            return interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            return interaction.reply(":exclamation: **An error occurred while trying to view the queue.**");
        }
    }
};

/**
 * Credits: Arpan | @arpandevv
 * Buy: https://feji.us/hx7je8
 */