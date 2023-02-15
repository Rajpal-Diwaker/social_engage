'use strict';

var Models = require('../Models/rewardsCard');

var updateRewardsCard = function (criteria, dataToSet, options, callback) {
    options.lean = true;
    options.new = true;
    Models.findOneAndUpdate(criteria, dataToSet, options, callback);
};

//Insert Student in DB
var createRewardsCard = function (objToSave, callback) {
    new Models(objToSave).save(callback)
};
//Delete Student in DB
var deleteRewardsCard = function (criteria, callback) {
    Models.findOneAndRemove(criteria, callback);
};

//Get Students from DB
var getRewardsCard = function (criteria, projection, options, callback) {
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
    updateRewardsCard: updateRewardsCard,
    createRewardsCard: createRewardsCard,
    deleteRewardsCard: deleteRewardsCard,
    getRewardsCard: getRewardsCard,
    getOneRule: getOneRule,
    paginateData: paginateData
}