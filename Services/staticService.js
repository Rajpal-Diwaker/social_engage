let staticDAO = require('../DAO/staticDAO'),
    async = require('async'),
    util = require('../Utilities/util'),
    config = require("../Utilities/config").config,
    l = console.log;

let staticApi = (data, callback) =>
    async.auto({
        checkStaticExistsInDB: (cb) => {
            let criteria;
            if (data.staticType) {
                criteria = {
                    staticType: data.staticType,
                    status: 'ACTIVE'
                }
            } else {
                criteria = {}
            }

            staticDAO.getstaticContent(criteria, {}, {}, (err, staticContent) => {
                if (err) {
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                    return;
                } else if (staticContent.length == 0) {
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.NO_DATA });
                    return;
                } else {
                    cb(null, { result: staticContent })
                }
            })
        },
        
        getStaticContentData: ['checkStaticExistsInDB', (functionData, cb) => {
            console.log("::::::::::::::::::::::::::", functionData)
            if (functionData.checkStaticExistsInDB && functionData.checkStaticExistsInDB.statusCode) {
                cb(null, functionData.checkStaticExistsInDB)
                return;
            } else {

                cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.STATIC_FOUND, staticData: functionData.checkStaticExistsInDB.result })
            }

        }]
    }, (error, response) => {
        callback(response.getStaticContentData)
    })

let staticPageUpdate = (data, callback) => {
    async.auto({
        checkStaticExistsInDB: (cb) => {
            let criteria;
            if (data.staticType) {
                criteria = {
                    staticType: data.staticType,
                    status: 'ACTIVE'
                }
            } else {
                criteria = {}
            }
            staticDAO.getstaticContent(criteria, (err, staticContent) => {
                if (err) {
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                    return;
                } else if (staticContent.docs.length == 0) {
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.NO_DATA });
                    return;
                } else {
                    cb(null, { result: staticContent })
                }
            })
        },
        getStaticContentData: ['checkStaticExistsInDB', (functionData, cb) => {
            if (functionData.checkStaticExistsInDB && functionData.checkStaticExistsInDB.statusCode) {
                cb(null, functionData.checkStaticExistsInDB)
            }
            let criteria = {
                staticType: data.staticType
            }
            staticDAO.updatestaticContent(criteria, data, {}, (err, updated) => {
                if (err) {
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                    return;
                }
                cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.STATIC_UPDTAED, data: updated })
            })
            cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.STATIC_FOUND, staticData: functionData.checkStaticExistsInDB.result })

        }]
    }, (error, response) => {
        callback(response.getStaticContentData)
    })
}


module.exports = {
    staticApi: staticApi,
    staticPageUpdate: staticPageUpdate
}