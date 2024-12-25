const { model, Schema } = require('mongoose');

let afkSchema = new Schema({
  User: String,
  Guild: String,
  Message: String,
  Nickname: String,
})

module.exports = model('afkS', afkSchema);

/*
true
500365
4ADRI3L
29648
177175
1735163178
d807c52a1e1b6fa455eecb714cecb929
*/