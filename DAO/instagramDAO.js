'use strict';

var Models = require('../Models/instagramModel');

var updateInstagram = function (criteria, dataToSet, options, callback) {
    options.lean = true;
    options.new = true;
    Models.findOneAndUpdate(criteria, dataToSet, options, callback);
};

//Insert Student in DB
var createInstagram = function (objToSave, callback) {
    new Models(objToSave).save(callback)
};

//Get Students from DB
var getInstagram = function (criteria, projection, options, callback) {
    options.lean = true;
    Models.find(criteria, projection, options, callback);
};
var getOneInstagram = function (criteria, callback) {
    // options.lean = true;
    Models.findOne(criteria, callback);
};

module.exports = {
    updateInstagram: updateInstagram,
    createInstagram: createInstagram,
    getInstagram: getInstagram,
    getOneInstagram: getOneInstagram
}
