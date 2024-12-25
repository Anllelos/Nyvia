const {model, Schema} = require('mongoose');
 
let mvote = new Schema({
    Guild: String,
    Msg: String,
    UpMembers: Array,
    DownMembers: Array,
    Upvote: Number,
    Downvote: Number,
    Owner: String
});
 
module.exports = model("mvote", mvote);