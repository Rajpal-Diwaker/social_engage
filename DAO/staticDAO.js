'use strict';

var Models = require('../Models/staticModel');

var updatestaticContent = function (criteria, dataToSet, options, callback) {
    options.lean = true;
    options.new = true;
    Models.findOneAndUpdate(criteria, dataToSet, options, callback);
};

//Delete Student in DB
var deletestaticContent = function (criteria, callback) {
    Models.findOneAndRemove(criteria, callback);
};

//Get Students from DB
var getstaticContent = function (criteria, projection, options, callback) {
    options.lean = true;
    Models.find(criteria, projection, options, callback);
};

var getOnestaticContent = function (criteria, callback) {
    // options.lean = true;
    Models.findOne(criteria, callback);
};

module.exports = {
    updatestaticContent: updatestaticContent,
    deletestaticContent: deletestaticContent,
    getstaticContent: getstaticContent,
    getOnestaticContent: getOnestaticContent
}