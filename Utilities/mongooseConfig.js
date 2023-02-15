var mongoose = require('mongoose');
mongoose.set('debug', true);
var config = require("../Utilities/config").config;

module.exports = function() {
    mongoose.Promise = global.Promise;
    // var db = mongoose.connect("mongodb://127.0.0.1:27017/test");
    var db = mongoose.connect(config.DB_URL.url);
    require('../Models/User');
    return db;
};

