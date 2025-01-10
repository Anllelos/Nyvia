const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const formatDuration = require("../../Handlers/Music/formatDuration");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("backward")
    .setDescription("⏪ Backward the current song by a specified amount of time.")
    .addIntegerOption(option =>
      option.setName("seconds")
        .setDescription("The amount of time to backward the song by.")
        .setRequired(true)),

  async execute(interaction, client) {
    try {
      const player = client.manager.players.get(interaction.guild.id);

      if (!player) {
        return interaction.reply({
          content: ":no_entry_sign: **There is no song playing right now!**",
          ephemeral: true
        });
      }

      if (!player.queue.current) {
        return interaction.reply({
          content: ":no_entry_sign: **There is no song playing right now!**",
          ephemeral: true
        });
      }

      const seconds = interaction.options.getInteger("seconds");

      if (seconds < 0) {
        return interaction.reply({
          content: ":no_entry_sign: **You can't backward the song by a negative amount of time!**",
          ephemeral: true
        });
      }

      const position = player.position - (seconds * 1000);

      if (position < 0) {
        return interaction.reply({
          content: ":no_entry_sign: **You can't backward the song by that much!**",
          ephemeral: true
        });
      }

      player.seek(position);

      const embed = new EmbedBuilder()
        .setColor(client.config.embed)
        .setTitle(":rewind: Song Backwarded")
        .setDescription(`**[${player.queue.current.title}](${player.queue.current.uri})** \n\n**Backwarded by:** \`${interaction.user.username}\``)
        .setFooter({ text: `Backwarded to ${formatDuration(position, true)} :notes:` });

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      return interaction.reply(":exclamation: **An error occurred while trying to backward the song.**");
    }
  }
};

/**
 * Credits: Arpan | @arpandevv
 * Buy: https://feji.us/hx7je8
 */