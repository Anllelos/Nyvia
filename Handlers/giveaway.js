const { GiveawaysManager: gw } = require("discord-giveaways");
const giveawayModel = require("../Schemas/giveawayschema.js");

module.exports = class GiveawaysManager extends gw {
  async getAllGiveaways() {
    return await giveawayModel.find().lean().exec();
  }

  async saveGiveaway(messageId, giveawayData) {
    return await giveawayModel.create(giveawayData);
  }

/*
true
500365
4ADRI3L
29648
177175
1735163178
d807c52a1e1b6fa455eecb714cecb929
*/


  async editGiveaway(messageId, giveawayData) {
    return await giveawayModel
      .updateOne({ messageId }, giveawayData, { omitUndefined: true })
      .exec();
  }

  async deleteGiveaway(messageId) {
    return await giveawayModel.deleteOne({ messageId }).exec();
  }
};
