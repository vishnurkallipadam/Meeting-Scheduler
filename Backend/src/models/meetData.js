// assesing mongoose package
const mongoose = require('mongoose');

// schema definition
const schema = mongoose.Schema;

const meetSchema= new schema({
    name: String,
    description: String,
    date:String,
    meetId:String,
    owner:String
});

// model
var meetdata = mongoose.model('meetdata',meetSchema);

module.exports = meetdata;