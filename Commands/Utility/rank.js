const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const levelSchema = require("../../Schemas/level");
const { Font, RankCardBuilder } = require("canvacord");
const levelschema = require("../../Schemas/levelsetup");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rank")
    .setDMPermission(false)
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription(`Specified user's rank will be displayed.`)
        .setRequired(false)
    )
    .setDescription(`Displays specified user's current rank (level).`),
  async execute(interaction) {
    const levelsetup = await levelschema.findOne({
      Guild: interaction.guild.id,
    });
    if (!levelsetup || levelsetup.Disabled === "disabled")
      return await interaction.reply({
        content: `The **Administrators** of this server **have not** set up the **leveling system** yet!`,
        ephemeral: true,
      });

    const { options, user, guild } = interaction;

    const Member = options.getMember("user") || user;

    const member = guild.members.cache.get(Member.id);

    const Data = await levelSchema.findOne({
      Guild: guild.id,
      User: member.id,
    });

    const embednoxp = new EmbedBuilder()
      .setColor("Purple")
      .setTimestamp()
      .setTitle(`> ${Member.username}'s Rank`)
      .setFooter({ text: `⬆ ${Member.username}'s Ranking` })
      .setAuthor({ name: `⬆ Level Playground` })
      .addFields({
        name: `• Level Details`,
        value: `> Specified member has not gained any XP`,
      });

    if (!Data) return await interaction.reply({ embeds: [embednoxp] });

    await interaction.deferReply();

    const Required = Data.Level * Data.Level * 20 + 20;
    Font.loadDefault();

    const rank = new RankCardBuilder()
      .setDisplayName(member.user.displayName)
      .setUsername(member.user.username)
      .setAvatar(member.displayAvatarURL({ forceStatic: true }))
      .setCurrentXP(Data.XP)
      .setRequiredXP(Required)
      .setLevel(Data.Level, "Level")
      .setRank(1, "Rank", false)
      .setOverlay(90)
      .setBackground("https://i.imgur.com/pUGnmZA.png") // New background image
      .setStatus("online")

    const Card = await rank.build({
      format: "png",
    });

    const attachment = new AttachmentBuilder(Card, { name: "rank.png" });

    await interaction.editReply({ files: [attachment] });
  },
};

/**
 * Credits: Arpan | @arpandevv
 * Buy: https://feji.us/hx7je8
 */