// assesing mongoose package
const mongoose = require('mongoose');
// database connection




// schema definition
const schema = mongoose.Schema;
const chatSchema= new schema({   
    user:String,
    message:String,
    room:String,
    date:String,
    time:String,
    month:String,
});

// model
var chatdata = mongoose.model('chatmsg',chatSchema);
module.exports = chatdata;