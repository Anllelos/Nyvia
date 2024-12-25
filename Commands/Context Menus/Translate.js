const {
  ContextMenuInteraction,
  EmbedBuilder,
  ContextMenuCommandBuilder,
  ApplicationCommandType,
} = require("discord.js");
const translate = require("@iamtraction/google-translate");

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName("Translate")
    .setType(ApplicationCommandType.Message)
    .setDMPermission(false),
  /**
   *
   * @param {ContextMenuInteraction} interaction
   */
  async execute(interaction, client) {
    const { channel, targetId } = interaction;

    const query = await channel.messages.fetch(targetId);
    const raw = query.content;

    const translated = await translate(query, { to: "en" });

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(client.config.embed)
          .setTitle(`Translated to English Language`)
          .addFields(
            {
              name: `<:dot:1272208757601992714> Your text:`,
              value: `\`\`\`${raw}\`\`\``,
            },
            {
              name: `<:dot:1272208757601992714> Translated text:`,
              value: `\`\`\`${translated.text}\`\`\``,
            }
          )
          .setFooter({
            text: `Requested by ${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL(true),
          })
          .setTimestamp(),
      ],
    });
  },
};

/**
 * Credits: Arpan | @arpandevv
 * Buy: https://feji.us/hx7je8
 */