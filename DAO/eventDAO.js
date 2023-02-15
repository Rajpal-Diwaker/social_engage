'use strict';

var Models = require('../Models/eventsModel');

var updateEvent = function (criteria, dataToSet, options, callback) {
    options.lean = true;
    options.new = true;
    Models.findOneAndUpdate(criteria, dataToSet, options, callback);
};

//Insert Student in DB
var createEvent = function (objToSave, callback) {
    new Models(objToSave).save(callback)
};

var createMultipleEvent = function (objToSave,callback) {
    Models.insertMany(objToSave,callback)
};
//Delete Student in DB
var deleteEvent = function (criteria, callback) {
    Models.findOneAndRemove(criteria, callback);
};

//Get Students from DB
var getEvent = function (criteria, projection, options, callback) {
    options.lean = true;
    Models.find(criteria, projection, options, callback);
};

var paginateData = function (criteria, option, callback) {
    Models.paginate(criteria, option, callback)
}
var getOneEvent = function (criteria, callback) {
    // options.lean = true;
    Models.findOne(criteria, callback);
};

module.exports = {
    updateEvent: updateEvent,
    createEvent: createEvent,
    createMultipleEvent:createMultipleEvent,
    deleteEvent: deleteEvent,
    getEvent: getEvent,
    getOneEvent: getOneEvent,
    paginateData: paginateData
}