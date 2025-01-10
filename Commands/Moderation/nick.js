const {
  SlashCommandBuilder,
  PermissionsBitField,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("nick")
    .setDMPermission(false)
    .setDescription(`Change specified user's nickname.`)
    .addStringOption((option) =>
      option
        .setName("nick")
        .setDescription(
          `Specified nickname will become specified user's new nickname.`
        )
        .setRequired(true)
        .setMaxLength(32)
        .setMinLength(2)
    )
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription(`Specified user's nickname will be changed.`)
    ),
  async execute(interaction, client) {
    const nick = await interaction.options.getString("nick");
    const user = await interaction.options.getUser("user");
    const member = await interaction.options.getMember("user");

    if (user === interaction.user || user === null) {
      if (
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.ChangeNickname
        ) &&
        interaction.user.id !== client.config.developerid
      )
        return await interaction.reply({
          content: "<:cross:1271441946283610195> | You **do not** have the permission to do that!",
          ephemeral: true,
        });

      await interaction.member.setNickname(nick).catch((err) => {
        return interaction.reply({
          content: `<:cross:1271441946283610195> | **Couldn't** change your nickname! **Check** my permissions and **role position** and try again.`,
          ephemeral: true,
        });
      });

      await interaction.reply({
        content: `<:tick:1271441993532444763> | Your **nickname** has been set to "**${nick}**"!`,
        ephemeral: true,
      });
    } else {
      if (
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.ManageNicknames
        ) &&
        interaction.user.id !== client.config.developerid
      )
        return await interaction.reply({
          content: `<:cross:1271441946283610195> | You **do not** have the permission to change someone **else's** nickname!`,
          ephemeral: true,
        });
      else {
        await member.setNickname(nick).catch((err) => {
          return interaction.reply({
            content: `<:cross:1271441946283610195> | **Couldn't** change the nickname of ${user}! **Check** my permissions and **role position** and try again.`,
            ephemeral: true,
          });
        });
        await interaction.reply({
          content: `<:tick:1271441993532444763> | You **successfuly** set ${member}'s nickname to "**${nick}**"!`,
          ephemeral: true,
        });
      }
    }
  },
};

/**
 * Credits: Arpan | @arpandevv
 * Buy: https://feji.us/hx7je8
 */