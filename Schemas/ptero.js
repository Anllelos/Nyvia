const { model, Schema } = require('mongoose');

const schema = new Schema({
    discordId: String,
    panelURL: String,
    apiKey: String,
});

module.exports = model('ptero', schema);