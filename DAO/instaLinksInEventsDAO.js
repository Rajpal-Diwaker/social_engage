'use strict';

var Models = require('../Models/instaLinksOfEventsModel');

var updateInstalinksEvents = function (criteria, dataToSet, options, callback) {
    options.lean = true;
    options.new = true;
    Models.findOneAndUpdate(criteria, dataToSet, options, callback);
};

//Insert Student in DB
var createInstalinksEvents = function (objToSave, callback) {
    new Models(objToSave).save(callback)
};
//Delete Student in DB
var deleteInstalinksEvents = function (criteria, callback) {
    Models.findOneAndRemove(criteria, callback);
};

//Get Students from DB
var getInstalinksEvents = function (criteria, projection, options, callback) {
    options.lean = true;
    Models.find(criteria, projection, options, callback);
};

var paginateData = function (criteria, option, callback) {
    Models.paginate(criteria, option, callback)
}
var getOneInstalinksEvents = function (criteria, callback) {
    // options.lean = true;
    Models.findOne(criteria, callback);
};

var randomCards = function (criteria , callback){
    Models.aggregate(criteria,callback);
}

module.exports = {
    updateInstalinksEvents: updateInstalinksEvents,
    createInstalinksEvents: createInstalinksEvents,
    deleteInstalinksEvents: deleteInstalinksEvents,
    getInstalinksEvents: getInstalinksEvents,
    getOneInstalinksEvents: getOneInstalinksEvents,
    paginateData: paginateData,
    randomCards:randomCards
}