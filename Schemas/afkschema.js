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
184761
1736522047
c92c171738798e98c3932fea44bdf86f
*/