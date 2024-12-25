const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require("discord.js");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Prodia } = require("prodia.js");
const aiConfig = require("../../Schemas/aiSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ai-config")
    .setDescription("Configure Artificial Intelligence in your server!")

    .addSubcommand((com) =>
      com
        .setName("configure")
        .setDescription("Bind AI to a channel.")
        .addChannelOption((opt) =>
          opt
            .setName("channel")
            .setDescription("Channel for the artificial intelligence.")
            .setRequired(true)
        )
    )

    .addSubcommand((com) =>
      com
        .setName("blacklist")
        .setDescription("Blacklist a user from using AI")
        .addStringOption((opt) =>
          opt
            .setName("action")
            .setDescription("Add or remove.")
            .addChoices(
              { name: "Add", value: "add" },
              { name: "Remove", value: "remove" },
            )
            .setRequired(true)
        )
        .addUserOption((opt) =>
          opt
            .setName("user")
            .setDescription("User to blacklist")
            .setRequired(true)
        )
    )

    .addSubcommand((com) =>
      com
        .setName("disable")
        .setDescription("Disable AI in the server.")
    )

    .addSubcommand((com) =>
      com
        .setName("view")
        .setDescription("View the current AI configuration.")
    ),

  execute: async function (interaction, client) {
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.Administrator
      )
    )
      return await interaction.reply({
        content: `<:error:1238390205707325500> | You don't have perms to manage the anti ghost ping system`,
        ephemeral: true,
      });
    const subcommand = interaction.options.getSubcommand();
    let data = await aiConfig.findOne({ guildId: interaction.guild.id });
    const embed = new EmbedBuilder()
      .setAuthor({ name: `AI Config`, iconURL: client.user.displayAvatarURL() })
      .setColor(client.config.embed)
      .setTimestamp();

    switch (subcommand) {
      case "configure":
        const channel = interaction.options.getChannel("channel");
        if (!data) {
          await aiConfig.create({
            guildId: interaction.guild.id,
            channelId: channel.id,
          });

          embed
            .setColor(client.config.embed)
            .setAuthor({ name: `🤖 Ai-Chat System` })
            .setFooter({ text: `🤖 Ai-Chat Added` })
            .addFields({
              name: `• Channel Added`,
              value: `> Artificial Intelligence has been bound to ${channel}`,
            })
            .setTimestamp()
            .setTitle("> Channel Added")
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true }));
        } else {
          await aiConfig.findOneAndUpdate({
            guildId: interaction.guild.id,
            channelId: channel.id,
          });

          embed
            .setColor(client.config.embed)
            .setAuthor({ name: `🤖 Ai-Chat System` })
            .setFooter({ text: `🤖 Ai-Chat Added` })
            .addFields({
              name: `• Channel Added`,
              value: `> Artificial Intelligence has been changed to ${channel}`,
            })
            .setTimestamp()
            .setTitle("> Channel Added")
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true }));
        }
        break;
      case "blacklist":
        const user = interaction.options.getUser("user");
        const action = interaction.options.getString("action");
        if (!data)
          return interaction.reply({
            content: `You need to configure artificial intelligence before adding or removing blacklists.`,
            ephemeral: true,
          });

        if (action === "add") {
          if (data.blacklists.includes(user.id)) {
            return interaction.reply({
              content: "This user is already blacklisted...",
              ephemeral: true,
            });
          } else {
            data.blacklists.push(user.id);
            embed.setDescription(
              `${user} has been blacklisted from using Artificial Intelligence in this server.\nUse \`/ai-config blacklist remove\` to undo this action.`
            );
          }
        } else if (action === "remove") {
          let updatedArr = data.blacklists.filter((userID) => userID !== user.id);
          data.blacklists = updatedArr;

          embed.setDescription(
            `${user} has been removed from the blacklist. They can now use AI again.`
          );
        }
        await data.save();
        break;
      case "disable":
        if (!data)
          return interaction.reply({
            content: `You need to configure artificial intelligence before disabling it.`,
            ephemeral: true,
          });

        await aiConfig.findOneAndDelete({ guildId: interaction.guild.id });

        embed.setDescription(
          `Artificial Intelligence has been disabled in this server.`
        );
        break;
 case "view":
        const channelid = data.channelId;
        const channell = interaction.guild.channels.cache.get(channelid);

        const whitelistedUsers = await Promise.all(
          data.blacklists.map(async (userId) => {
            try {
              const user = await interaction.client.users.fetch(userId);
              return `- ${user.displayName}\n`;
            } catch (error) {
              client.logs.error(error);
            }
          })
        );

        embed.setDescription(
          `Current AI Configuration:\n\n> Channel: ${channell}\n> Blacklisted users:\n> ${whitelistedUsers.join("")}`
        );
        break;
    }
    await interaction.reply({ embeds: [embed] });
  },
};