const {
  ContextMenuInteraction,
  EmbedBuilder,
  ContextMenuCommandBuilder,
  ApplicationCommandType,
} = require("discord.js");

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName("UserInfo")
    .setType(ApplicationCommandType.User)
    .setDMPermission(false),
  /**
   *
   * @param {ContextMenuInteraction} interaction
   */
  async execute(interaction, client) {
    const target = await interaction.guild.members.fetch(interaction.targetId);
    const user = await interaction.guild.members.fetch(target.id);

    const response = new EmbedBuilder()
      .setColor(client.config.embed)
      .setAuthor({
        name: target.user.tag,
        iconURL: target.user.displayAvatarURL(),
      })
      .setThumbnail(target.user.displayAvatarURL())
      .addFields(
        { name: "<:user:1271441999819706441> Member", value: `${target}`, inline: true },
        { name: "<:error:1271441954399453265> Nickname", value: target.nickname || "None", inline: true },
        { name: "<:bot:1271445699803742209> Bot Account", value: `${user.bot ? "True" : "False"}` },
        {
          name: "<:info:1271441965656834048> Roles",
          value: `${target.roles.cache.map((r) => r).join(" ")}`,
          inline: false,
        },
        {
          name: "<:add:1271441931708272710> Joined Server",
          value: `<t:${parseInt(target.joinedAt / 1000)}:R>`,
          inline: true,
        },
        {
          name: "<:home:1271444957454008350> Joined Discord",
          value: `<t:${parseInt(target.user.createdAt / 1000)}:R>`,
          inline: true,
        }
      )
      .setFooter({ text: `User ID: ${target.user.id}` })
      .setTimestamp();

    await interaction.reply({ embeds: [response], ephemeral: true });
  },
};

/**
 * Credits: Arpan | @arpandevv
 * Buy: https://feji.us/hx7je8
 */