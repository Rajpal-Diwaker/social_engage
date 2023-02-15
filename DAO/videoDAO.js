'use strict';

var Models = require('../Models/videoModel');

var updateVideo = function (criteria, dataToSet, options, callback) {
    options.lean = true;
    options.new = true;
    Models.findOneAndUpdate(criteria, dataToSet, options, callback);
};

//Insert Student in DB
var createVideo = function (objToSave, callback) {
    new Models(objToSave).save(callback)
};

//Get Students from DB
var getVideo = function (criteria, projection, options, callback) {
    options.lean = true;
    Models.find(criteria, projection, options, callback);
};
var getOneVideo = function (criteria, callback) {
    // options.lean = true;
    Models.findOne(criteria, callback);
};

module.exports = {
    updateVideo: updateVideo,
    createVideo: createVideo,
    getVideo: getVideo,
    getOneVideo: getOneVideo
}
