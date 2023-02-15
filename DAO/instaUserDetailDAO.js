'use strict';

var Models = require('../Models/instaUserDetail');

var updateInstaUserDetail = function (criteria, dataToSet, options, callback) {
    options.lean = true;
    options.new = true;
    Models.findOneAndUpdate(criteria, dataToSet, options, callback);
};

//Insert Student in DB
var createInstaUserDetail = function (objToSave, callback) {
    new Models(objToSave).save(callback)
};

//Get Students from DB
var getInstaUserDetail = function (criteria, projection, options, callback) {
    options.lean = true;
    Models.find(criteria, projection, options, callback);
};
var getOneInstaUserDetail = function (criteria, callback) {
    // options.lean = true;
    Models.findOne(criteria, callback);
};

module.exports = {
    updateInstaUserDetail: updateInstaUserDetail,
    createInstaUserDetail: createInstaUserDetail,
    getInstaUserDetail: getInstaUserDetail,
    getOneInstaUserDetail: getOneInstaUserDetail
}
