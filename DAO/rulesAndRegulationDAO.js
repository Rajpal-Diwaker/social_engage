'use strict';

var Models = require('../Models/rulesAndRegulation');

var updateRules = function (criteria, dataToSet, options, callback) {
    options.lean = true;
    options.new = true;
    Models.findOneAndUpdate(criteria, dataToSet, options, callback);
};

//Insert Student in DB
var createRules = function (objToSave, callback) {
    new Models(objToSave).save(callback)
};
//Delete Student in DB
var deleteRules = function (criteria, callback) {
    Models.findOneAndRemove(criteria, callback);
};

//Get Students from DB
var getRules = function (criteria, projection, options, callback) {
    options.lean = true;
    Models.find(criteria, projection, options, callback);
};

var paginateData = function (criteria, option, callback) {
    Models.paginate(criteria, option, callback)
}
var getOneRule = function (criteria, callback) {
    // options.lean = true;
    Models.findOne(criteria, callback);
};

module.exports = {
    updateRules: updateRules,
    createRules: createRules,
    deleteRules: deleteRules,
    getRules: getRules,
    getOneRule: getOneRule,
    paginateData: paginateData
}