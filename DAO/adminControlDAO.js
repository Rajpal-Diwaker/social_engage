'use strict';

var Models = require('../Models/adminControlModel');

var updateAdminControl = function (criteria, dataToSet, options, callback) {
    options.lean = true;
    options.new = true;
    Models.findOneAndUpdate(criteria, dataToSet, options, callback);
};

//Delete Student in DB
var deleteAdminControl = function (criteria, callback) {
    Models.findOneAndRemove(criteria, callback);
};

//Get Students from DB
var getAdminControl = function (criteria, projection, options, callback) {
    options.lean = true;
    Models.find(criteria, projection, options, callback);
};

var getOneAdminControl = function (criteria, callback) {
    // options.lean = true;
    Models.findOne(criteria, callback);
};

module.exports = {
    updateAdminControl: updateAdminControl,
    deleteAdminControl: deleteAdminControl,
    getAdminControl: getAdminControl,
    getOneAdminControl: getOneAdminControl
}