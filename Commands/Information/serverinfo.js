const {
    ChatInputCommandInteraction,
    EmbedBuilder,
    ChannelType,
    GuildVerificationLevel,
    GuildExplicitContentFilter,
    GuildNSFWLevel,
    SlashCommandBuilder,
  } = require("discord.js");
  
  module.exports = {
    data: new SlashCommandBuilder()
      .setName("serverinfo")
      .setDescription("Displays information about the server."),
    /**
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction, client) {
      const { guild } = interaction;
      const { members, channels, emojis, roles, stickers } = guild;
  
      const sortedRoles = roles.cache
        .map((role) => role)
        .slice(1, roles.cache.size)
        .sort((a, b) => b.position - a.position);
      const userRoles = sortedRoles.filter((role) => !role.managed);
      const managedRoles = sortedRoles.filter((role) => role.managed);
      const botCount = members.cache.filter((member) => member.user.bot).size;
  
      const maxDisplayRoles = (roles, maxFieldLength = 1024) => {
        let totalLength = 0;
        const result = [];
  
        for (const role of roles) {
          const roleString = `<@&${role.id}>`;
  
          if (roleString.length + totalLength > maxFieldLength) break;
  
          totalLength += roleString.length + 1; // +1 as it's likely we want to display them with a space between each role, which counts towards the limit.
          result.push(roleString);
        }
  
        return result.length;
      };
  
      const splitPascal = (string, separator) =>
        string.split(/(?=[A-Z])/).join(separator);
      const toPascalCase = (string, separator = false) => {
        const pascal =
          string.charAt(0).toUpperCase() +
          string
            .slice(1)
            .toLowerCase()
            .replace(/[^a-zA-Z0-9]+(.)/g, (match, chr) => chr.toUpperCase());
        return separator ? splitPascal(pascal, separator) : pascal;
      };
  
      const getChannelTypeSize = (type) =>
        channels.cache.filter((channel) => type.includes(channel.type)).size;
  
      const totalChannels = getChannelTypeSize([
        ChannelType.GuildText,
        ChannelType.GuildNews,
        ChannelType.GuildVoice,
        ChannelType.GuildStageVoice,
        ChannelType.GuildForum,
        ChannelType.GuildPublicThread,
        ChannelType.GuildPrivateThread,
        ChannelType.GuildNewsThread,
        ChannelType.GuildCategory,
      ]);
  
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(members.me.roles.highest.hexColor)
            .setTitle(`${guild.name}'s Information`)
            .setThumbnail(guild.iconURL({ size: 1024 }))
            .setImage(guild.bannerURL({ size: 1024 }))
            .addFields(
              { name: "Description", value: `<:fire:1271441960430862367> ${guild.description || "None"}` },
              {
                name: "General",
                value: [
                  `<:add:1271441931708272710> **Created** <t:${parseInt(
                    guild.createdTimestamp / 1000
                  )}:R>`,
                  `<:info:1271441965656834048> **ID** \`${guild.id}\``,
                  `<:owner:1271444966362714112> **Owner** <@${guild.ownerId}>`,
                  `<:dot:1272208757601992714> **Language** \`${new Intl.DisplayNames(
                    ["en"],
                    {
                      type: "language",
                    }
                  ).of(guild.preferredLocale)}\``,
                  `<:error:1271441954399453265> **Vanity URL** ${
                    guild.vanityURLCode || "None"
                  }`,
                ].join("\n"),
              },
              {
                name: "Features",
                value:
                  guild.features
                    ?.map((feature) => `- ${toPascalCase(feature, " ")}`)
                    ?.join("\n") || "None",
                inline: true,
              },
              {
                name: "Security",
                value: [
                  `<:thunderr:1271447633789063262> **Explicit Filter** \`${splitPascal(
                    GuildExplicitContentFilter[guild.explicitContentFilter],
                    " "
                  )}\``,
                  `<:restricted:1271447622137417829> **NSFW Level** \`${splitPascal(
                    GuildNSFWLevel[guild.nsfwLevel],
                    " "
                  )}\``,
                  `<:lock:1271445703771820173> **Verification Level** \`${splitPascal(
                    GuildVerificationLevel[guild.verificationLevel],
                    " "
                  )}\``,
                ].join("\n"),
                inline: true,
              },
              {
                name: `Users (\`${guild.memberCount}\`)`,
                value: [
                  `<:members:1271441968488251442> **Members** \`${
                    guild.memberCount - botCount
                  }\``,
                  `<:bot:1271445699803742209> **Bots** \`${botCount}\``,
                ].join("\n"),
                inline: true,
              },
              {
                name: `User Roles (${maxDisplayRoles(userRoles)} of ${
                  userRoles.length
                })`,
                value: `${
                  userRoles.slice(0, maxDisplayRoles(userRoles)).join(" ") ||
                  "None"
                }`,
              },
              {
                name: `Managed Roles (${maxDisplayRoles(managedRoles)} of ${
                  managedRoles.length
                })`,
                value: `${
                  managedRoles
                    .slice(0, maxDisplayRoles(managedRoles))
                    .join(" ") || "None"
                }`,
              },
              {
                name: `Channels, Threads & Categories (${totalChannels})`,
                value: [
                  `<:announcement:1271441937479503973> **Text** \`${getChannelTypeSize(
                    [
                      ChannelType.GuildText,
                      ChannelType.GuildForum,
                      ChannelType.GuildNews,
                    ]
                  )}\``,
                  `<:vol:1271447637727510558> **Voice** \`${getChannelTypeSize([
                    ChannelType.GuildVoice,
                    ChannelType.GuildStageVoice,
                  ])}\``,
                  `<:thread:1272214084846358628> **Threads** \`${getChannelTypeSize(
                    [
                      ChannelType.GuildPublicThread,
                      ChannelType.GuildPrivateThread,
                      ChannelType.GuildNewsThread,
                    ]
                  )}\``,
                  `<:cate:1272214271056412672> **Categories** \`${getChannelTypeSize(
                    [ChannelType.GuildCategory]
                  )}\``,
                ].join("\n"),
                inline: true,
              },
              {
                name: `Emojis & Stickers (${
                  emojis.cache.size + stickers.cache.size
                })`,
                value: [
                  `<:dot:1272208757601992714> **Animated** ${
                    emojis.cache.filter((emoji) => emoji.animated).size
                  }`,
                  `<:dot:1272208757601992714> **Static** ${
                    emojis.cache.filter((emoji) => !emoji.animated).size
                  }`,
                  `<:dot:1272208757601992714> **Stickers** ${stickers.cache.size}`,
                ].join("\n"),
                inline: true,
              },
              {
                name: "Nitro",
                value: [
                  `<:boost:1271441943192273027> **Tier** ${
                    guild.premiumTier || "None"
                  }`,
                  `<:dot:1272208757601992714> **Boosts** ${guild.premiumSubscriptionCount}`,
                  `<:dot:1272208757601992714> **Boosters** ${
                    guild.members.cache.filter(
                      (member) => member.roles.premiumSubscriberRole
                    ).size
                  }`,
                  `<:dot:1272208757601992714> **Total Boosters** ${
                    guild.members.cache.filter((member) => member.premiumSince)
                      .size
                  }`,
                ].join("\n"),
                inline: true,
              },
              { name: "Banner", value: guild.bannerURL() ? "** **" : "None" }
            ),
        ],
        ephemeral: false,
      });
    },
  };
  