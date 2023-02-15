'use strict';

var Models = require('../Models/hashtagModel');

var updateHashTag = function (criteria, dataToSet, options, callback) {
    options.lean = true;
    options.new = true;
    Models.findOneAndUpdate(criteria, dataToSet, options, callback);
};

//Insert Student in DB
var createHashTag = function (objToSave, callback) {
    new Models(objToSave).save(callback)
};

//Get Students from DB
var getHashTag = function (criteria, projection, options, callback) {
    options.lean = true;
    Models.find(criteria, projection, options, callback);
};
var getOneHashTag = function (criteria, callback) {
    // options.lean = true;
    Models.findOne(criteria, callback);
};

module.exports = {
    updateHashTag: updateHashTag,
    createHashTag: createHashTag,
    getHashTag: getHashTag,
    getOneHashTag: getOneHashTag
}
