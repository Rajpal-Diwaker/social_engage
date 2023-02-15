'use strict';

var Models = require('../Models/User');

var updateUser = function (criteria, dataToSet, options, callback) {
    options.lean = true;
    options.new = true;
    Models.findOneAndUpdate(criteria, dataToSet, options, callback);
};

//Insert Student in DB
var createUser = function (objToSave, callback) {
    new Models(objToSave).save(callback)
};
//Delete Student in DB
var deleteStudent = function (criteria, callback) {
    Models.findOneAndRemove(criteria, callback);
};

//Get Students from DB
var getUser = function (criteria, projection, options, callback) {
    options.lean = true;
    Models.find(criteria, projection, options, callback);
};
var paginateData = function (criteria, option, callback) {
    Models.paginate(criteria, option, callback)
}
var getOneUser = function (criteria, callback) {
    // options.lean = true;
    Models.findOne(criteria, callback);
};

module.exports = {
    updateUser: updateUser,
    createUser: createUser,
    deleteStudent: deleteStudent,
    getUser: getUser,
    getOneUser: getOneUser,
    paginateData:paginateData
}
