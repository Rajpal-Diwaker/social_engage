'use strict';

var Models = require('../Models/groupsModel');

var updateGroup = function (criteria, dataToSet, options, callback) {
    options.lean = true;
    options.new = true;
    Models.findOneAndUpdate(criteria, dataToSet, options, callback);
};

//Insert Student in DB
var createGroup = function (objToSave, callback) {
    new Models(objToSave).save(callback)
};
//Delete Student in DB
var deleteGroup = function (criteria, callback) {
    Models.findOneAndRemove(criteria, callback);
};

//Get Students from DB
var getGroup = function (criteria, projection, options, callback) {
    options.lean = true;
    Models.find(criteria, projection, options, callback);
};

var paginateData = function (criteria, option, callback) {
    Models.paginate(criteria, option, callback)
}
var getOneGroup = function (criteria, callback) {
    // options.lean = true;
    Models.findOne(criteria, callback);
};

var trendingGroup = function(criteria,projection,sorting,limit,callback){
    Models.find(criteria , projection,{ sort: sorting, limit:limit },callback)
}

module.exports = {
    updateGroup: updateGroup,
    createGroup: createGroup,
    deleteGroup: deleteGroup,
    getGroup: getGroup,
    getOneGroup: getOneGroup,
    paginateData: paginateData,
    trendingGroup:trendingGroup
}