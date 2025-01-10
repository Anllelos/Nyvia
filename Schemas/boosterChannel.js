const mongoose = require('mongoose');

const boosterChannelSchema = new mongoose.Schema({
  channelId: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('BoosterChannel', boosterChannelSchema);