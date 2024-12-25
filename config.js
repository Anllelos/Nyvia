/**
 * Configuration settings for the Razor bot.
 * 
 * This file contains essential settings for bot functionality, 
 * including command prefixes, channel IDs, and API keys.
 * Ensure to fill in the required fields before deploying the bot.
 */
const config = {
  // Color for embedded bot messages
  embed: "#ff434e",
  // Command prefix for bot commands
  prefix: "-",
  // Channel ID for logging errors (Development Server)
  logchannel: "",
  // Channel ID for reporting bugs (Development Server)
  bugreport: "",
  // Channel ID for user feedback (Development Server)
  feedback: "",
  // Channel ID for receiving bot suggestions (Development Server)
  botsuggestions: "",
  // Your Discord User ID for development purposes
  developerid: "",
  // Your Discord Bot ID for API interactions
  clientID: "",
  // API key for image generation (Obtain from https://discord.gg/QprAy5WWWQ)
  imagegenapi: "",
  // API key for Gemini services (Obtain from https://ai.google.dev/)
  gemini_api: "",
  // API key for Prodia services (Obtain from https://app.prodia.com/api)
  prodia_api: "",

  // Lavalink server configuration
  lavalink: {
    name: `Razor Node`,
    url: `lavalink.anantix.network:2335`,
    auth: "pg6|(}7fuD_:7d#QQq?9",
    secure: false,
  },
};

module.exports = config;