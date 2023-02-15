'use strict';

var Models = require('../Models/warningModel');

var updatewarning = function (criteria, dataToSet, options, callback) {
    options.lean = true;
    options.new = true;
    Models.findOneAndUpdate(criteria, dataToSet, options, callback);
};

//Insert Student in DB
var createwarning = function (objToSave, callback) {
    new Models(objToSave).save(callback)
};

//Get Students from DB
var getwarning = function (criteria, projection, options, callback) {
    options.lean = true;
    Models.find(criteria, projection, options, callback);
};
var getOnewarning = function (criteria, callback) {
    // options.lean = true;
    Models.findOne(criteria, callback);
};

module.exports = {
    updatewarning: updatewarning,
    createwarning: createwarning,
    getwarning: getwarning,
    getOnewarning: getOnewarning
}
