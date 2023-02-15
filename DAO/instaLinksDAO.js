'use strict';

var Models = require('../Models/instaLinksModel');

var updateInstaLinks = function (criteria, dataToSet, options, callback) {
    options.lean = true;
    options.new = true;
    Models.findOneAndUpdate(criteria, dataToSet, options, callback);
};

//Insert Student in DB
var createInstaLinks = function (objToSave, callback) {
    new Models(objToSave).save(callback)
};
//Delete Student in DB
var deleteInstaLinks = function (criteria, callback) {
    Models.findOneAndRemove(criteria, callback);
};

//Get Students from DB
var getInstaLinks = function (criteria, projection, options, callback) {
    options.lean = true;
    Models.find(criteria, projection, options, callback);
};

var paginateData = function (criteria, option, callback) {
    Models.paginate(criteria, option, callback)
}
var getOneInstaLinks = function (criteria, callback) {
    // options.lean = true;
    Models.findOne(criteria, callback);
};

var randomCards = function (criteria , callback){
    Models.aggregate(criteria,callback);
}

module.exports = {
    updateInstaLinks: updateInstaLinks,
    createInstaLinks: createInstaLinks,
    deleteInstaLinks: deleteInstaLinks,
    getInstaLinks: getInstaLinks,
    getOneInstaLinks: getOneInstaLinks,
    paginateData: paginateData,
    randomCards:randomCards
}