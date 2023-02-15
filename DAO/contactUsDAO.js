'use strict';

var Models = require('../Models/contactUsModel');

var updatecontactUs = function (criteria, dataToSet, options, callback) {
    options.lean = true;
    options.new = true;
    Models.findOneAndUpdate(criteria, dataToSet, options, callback);
};

//Insert Student in DB
var createcontactUs = function (objToSave, callback) {
    new Models(objToSave).save(callback)
};
//Delete Student in DB
var deletecontactUs = function (criteria, callback) {
    Models.findOneAndRemove(criteria, callback);
};

//Get Students from DB
var getcontactUs = function (criteria, projection, options, callback) {
    options.lean = true;
    Models.find(criteria, projection, options, callback);
};

var paginateData = function (criteria, option, callback) {
    Models.paginate(criteria, option, callback)
}
var getOnecontactUs = function (criteria, callback) {
    // options.lean = true;
    Models.findOne(criteria, callback);
};

module.exports = {
    updatecontactUs: updatecontactUs,
    createcontactUs: createcontactUs,
    deletecontactUs: deletecontactUs,
    getcontactUs: getcontactUs,
    getOnecontactUs: getOnecontactUs,
    paginateData: paginateData
}