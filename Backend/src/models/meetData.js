// assesing mongoose package
const mongoose = require('mongoose');
// database connection
mongoose.connect('mongodb://localhost:27017/scheduler');

// schema definition
const schema = mongoose.Schema;

const meetSchema= new schema({
    name: String,
    description: String,
    date:String
});

// model
var meetdata = mongoose.model('meetdata',meetSchema);

module.exports = meetdata;