'use strict';

var Models = require('../Models/tipsAndTricksModel');

var updatetipsAndTricks = function (criteria, dataToSet, options, callback) {
    options.lean = true;
    options.new = true;
    Models.findOneAndUpdate(criteria, dataToSet, options, callback);
};

//Insert Student in DB
var createtipsAndTricks = function (objToSave, callback) {
    new Models(objToSave).save(callback)
};

//Get Students from DB
var gettipsAndTricks = function (criteria, projection, options, callback) {
    options.lean = true;
    Models.find(criteria, projection, options, callback);
};
var getOnetipsAndTricks = function (criteria, callback) {
    // options.lean = true;
    Models.findOne(criteria, callback);
};

module.exports = {
    updatetipsAndTricks: updatetipsAndTricks,
    createtipsAndTricks: createtipsAndTricks,
    gettipsAndTricks: gettipsAndTricks,
    getOnetipsAndTricks: getOnetipsAndTricks
}
