// assesing mongoose package
const mongoose = require('mongoose');


// schema definition
const schema = mongoose.Schema;

const userSchema= new schema({
    name: String,
    email: String,
    password:String
});

// model
var userdata = mongoose.model('userdata',userSchema);

module.exports = userdata;