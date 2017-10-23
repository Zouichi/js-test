var mongoose = require('mongoose');

var eventObjsSchema = mongoose.Schema({
    "data": String,
    "ttl": Number,
    "published_at": Date,
    "coreid": String,
    "name": String

});

var EventObj = mongoose.model('EventObj', eventObjsSchema);

module.exports = EventObj;
