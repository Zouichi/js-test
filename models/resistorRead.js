var mongoose = require('mongoose');

var resistorReadSchema = mongoose.Schema({
    "data": String,
    "ttl": Number,
    "published_at": Date,
    "published_at": Date,
    "coreid": String,
    "name": String

});

var resistorRead = mongoose.model('resistorRead', resistorReadSchema);

module.exports = resistorRead;
