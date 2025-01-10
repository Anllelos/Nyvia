const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const levelSchema = require("../../Schemas/level");
const { Canvas } = require("canvacord");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Displays the server's XP leaderboard")
    .setDMPermission(false),

  async execute(interaction) {
    const { guild } = interaction;

    await interaction.deferReply();

    try {
      // Fetch leaderboard data
      const leaderboardData = await levelSchema
        .find({ Guild: guild.id })
        .sort({ Level: -1, XP: -1 }) // Sort by level and XP in descending order
        .limit(10); // Limit to top 10 users

      if (!leaderboardData.length) {
        return await interaction.editReply({
          content: "No data found for the leaderboard.",
          ephemeral: true,
        });
      }

      // Prepare leaderboard data for rendering
      const users = [];
      for (const [index, user] of leaderboardData.entries()) {
        const member = guild.members.cache.get(user.User) || {
          user: {
            username: "Unknown User",
            displayAvatarURL: () => "https://i.imgur.com/AfFp7pu.png", // Fallback avatar URL
          },
        };

        users.push({
          rank: index + 1,
          username: member.user.username,
          avatar: member.user.displayAvatarURL({ forceStatic: true, extension: "png" }), // Force static PNG
          level: user.Level,
          xp: user.XP,
        });
      }

      // Create leaderboard image using Canvas
      const canvas = new Canvas.Leaderboard()
        .setBackground("https://i.imgur.com/pUGnmZA.png") // Background image
        .setWidth(800)
        .setHeight(900);

      // Add each user to the leaderboard
      users.forEach((user) => {
        canvas.addUser({
          avatar: user.avatar,
          username: user.username,
          rank: user.rank,
          level: user.level,
          currentXP: user.xp,
        });
      });

      const leaderboardImage = await canvas.build();

      // Send leaderboard image
      const attachment = new AttachmentBuilder(leaderboardImage, {
        name: "leaderboard.png",
      });

      await interaction.editReply({
        content: "Here is the leaderboard:",
        files: [attachment],
      });
    } catch (error) {
      console.error("Error generating leaderboard:", error);
      await interaction.editReply({
        content: "An error occurred while generating the leaderboard.",
        ephemeral: true,
      });
    }
  },
};

/**
 * Credits: Arpan | @arpandevv
 * Buy: https://feji.us/hx7je8
 */