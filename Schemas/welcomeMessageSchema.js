const mongoose = require("mongoose");

const welcomeMessageSchema = new mongoose.Schema({
    guildId: String,
    channelId: String,
    message: String,
    author: String,
    title: String,
    color: String,
    footer: String,
    image: String,
    isEmbed: { type: Boolean, default: true },
    isImage: { type: Boolean, default: true },
});
    
module.exports = mongoose.model("WelcomeMessage", welcomeMessageSchema);
    