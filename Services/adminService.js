let async = require('async'),
    util = require('../Utilities/util'),
    userDAO = require('../DAO/userDAO'),
    groupDAO = require('../DAO/groupDAO'),
    eventDAO = require('../DAO/eventDAO'),
    rewardsDAO=require ('../DAO/rewardDAO'),
    rewardsCardDAO = require('../DAO/rewardsCard'),
    adminControlDAO = require('../DAO/adminControlDAO'),
    instaLinksDAO = require('../DAO/instaLinksDAO'),
    contactUsDAO = require('../DAO/contactUsDAO'),
    mongoose = require('mongoose'),
    jwt = require('jsonwebtoken'),
    rulesAndRegulationDAO = require('../DAO/rulesAndRegulationDAO'),
    videoDAO = require('../DAO/videoDAO'),
    tipsAndTricksDao = require('../DAO/tipsAndTricksDAO'),
    config = require("../Utilities/config").config,
    cron = require("node-cron"),
    l = console.log;

var FCM = require('fcm-node');
var serverKey = 'AAAAkEh16QA:APA91bEy2GqDs7_Dmdjj1ST35junMmZY7HOjmKYBlrQvn98grDSHZ0-oyqYNzgSVDmBSCNyakIo44Tbl1NxvFHnhiAw3eqah8ghJxcSDr7j6eM8vAFDs2qZYtauzKO--esUFIJ2MYQoD';
var fcm = new FCM(serverKey);

let login = (data, callback) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            if (!data.email) {
                cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }
            var criteria = {
                email: data.email,
                status: "ACTIVE",
                userType: "ADMIN"
            }
            userDAO.getUser(criteria, {}, {}, (err, dbData) => {
                if (err) {
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                    return;
                }
                if (dbData && dbData.length > 0) {
                    if (dbData[0].verified == false) {
                        cb(null, { "statusCode": util.statusCode.NINE, "statusMessage": util.statusMessage.NOT_VERIFIED });
                    }
                    if (util.encryptData(data.password) == dbData[0].password) {
                        let token = jwt.sign({ _id: dbData[0]._id, time: Date.now }, config.SECURITY_KEY.KEY)
                        const data = {
                            userId: dbData[0]._id,
                            token: token
                        }
                        cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.LOGGED_IN, "result": data });
                    } else {
                        cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.INCORRECT_PASSWORD });
                    }


                } else {
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.EMAIL_NOT_EXISTS });
                }
            });

        }
    }, (err, response) => {
        callback(response.checkUserExistsinDB);
    })
}

let dashboard = (data, callback) => {
    async.auto({
        getUserDataFromDB: (cb) => {
            if (!data.adminId) {
                cb(null, { "statusCode": util.statusCode.ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }
            var criteria = {
                _id: data.adminId,
                status: "ACTIVE",
                userType: "ADMIN"
            }
            userDAO.getUser(criteria, {}, {}, async (err, dbData) => {
                console.log(dbData, "kjsdkfhksd", err)
                if (err) {
                    cb(null, { "statusCode": util.statusCode.ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                    return;
                }

                if (dbData && dbData.length > 0) {
                    cb(null);
                } else {
                    cb(null, { "statusCode": util.statusCode.NINE, "statusMessage": util.statusMessage.NO_DATA });
                }
            });
        },
        getAllUsers: ['getUserDataFromDB', (functionData, cb) => {
            if (functionData && functionData.getUserDataFromDB && functionData.getUserDataFromDB.statusCode) {
                cb(null, functionData.getUserDataFromDB);
                return;
            }

            var criteria = { userType: { $ne: "ADMIN" } };

            userDAO.getUser(criteria, {}, {}, function (err, dbData) {
                if (err) {
                    cb(null, { "statusCode": util.statusCode.ONE, "statusMessage": util.statusMessage.SERVER_BUSY });
                } else if (dbData && dbData.length == 0) {
                    cb(null, { "statusCode": util.statusCode.ONE, "statusMessage": util.statusMessage.NO_DATA });
                }
                else {
                    let bannedUsers=0;
                    for(let i =0;i<dbData.length;i++){
                       if(dbData[i].banned==true){
                           bannedUsers=bannedUsers+1;
                       }
                    }
                    groupDAO.getGroup({groupStatus:"ACTIVE"},{},{},(err,result)=>{
                        if(err){
                          return cb(null, { "statusCode": util.statusCode.ONE, "statusMessage": util.statusMessage.SERVER_BUSY });
                        }
                        else{
                           instaLinksDAO.getInstaLinks({},{},{},(err,result11)=>{
                               if(err){
                                return cb(null, { "statusCode": util.statusCode.ONE, "statusMessage": util.statusMessage.SERVER_BUSY });
                               }
                               else{
                                   let dashboard = {
                                     
                                        totalUsers:dbData.length?dbData.length:0,
                                        bannedUsers:bannedUsers?bannedUsers:0,
                                        activeGroups:result.length?result.length:0,
                                        links:result11.length?result11.length:0
                                   }

                                   cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.DATA_FETCHED, Users: dashboard });
                               }
                           })
                        }
                    })
                }
            });

        }]
    }, (err, response) => {
        callback(response.getAllUsers);
    })
}

let forgotPassword = (data, callback) => {
    async.auto({
        getUserDataFromDB: (cb) => {
            if (!data.email) {
                cb(null, { "statusCode": util.statusCode.ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }
            var criteria = {
                email: data.email,
                status: "ACTIVE",
                userType: "ADMIN"
            }
            userDAO.getUser(criteria, { mergedContact: 1, email: 1, _id: 1 }, {}, async (err, dbData) => {
                console.log(dbData, "kjsdkfhksd", err)
                if (err) {
                    cb(null, { "statusCode": util.statusCode.ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                    return;
                }

                if (dbData && dbData.length > 0) {

                    var OTP = Math.floor(100000 + Math.random() * 900000);
                    OTP = Math.abs(OTP)
                    let link = config.NODE_SERVER_URL.url + ":" + config.NODE_SERVER_PORT.port + "/admin/verifyforgotpasswordlink?userId=" + dbData[0]._id + "&otp=" + OTP;
                    await util.sendForgotPasswordMail({ "email": dbData[0].email, "OTP": OTP, link: link });
                    // await util.smsSender(dbData[0].mergedContact, OTP)
                    cb(null, { "OTP": OTP });
                } else {
                    cb(null, { "statusCode": util.statusCode.NINE, "statusMessage": util.statusMessage.EMAIL_NOT_EXIST });
                }
            });
        },
        updateUserinDB: ['getUserDataFromDB', (functionData, cb) => {
            if (functionData && functionData.getUserDataFromDB && functionData.getUserDataFromDB.statusCode) {
                cb(functionData.getUserDataFromDB);
                return;
            }

            var criteria = {
                email: data.email,
                status: "ACTIVE",
                userType: "ADMIN"
            };
            var dataToSet = {
                $set: {
                    "otp": functionData.getUserDataFromDB.OTP,
                    "otpExpireTime": Date.now()
                }
            }
            userDAO.updateUser(criteria, dataToSet, {}, function (err, dbData) {
                console.log("XXXXXXXXXXXXXXXX", err, "ZZZZZZZZZZZZZZZZZZZz", dbData)
                if (err) {
                    cb(null, { "statusCode": util.statusCode.ONE, "statusMessage": util.statusMessage.SERVER_BUSY });
                } else {
                    console.log("LLLLLLLLLLLLLLLLLLL", functionData.getUserDataFromDB.OTP, dbData.otpExpireTime)
                    cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.OTP_VERIFY_EMAIL });
                }
            });

        }]
    }, (err, response) => {
        console.log(response)
        callback(response.updateUserinDB);
    })
}
let verifyForgotPasswordLink = (data, callback) => {
    console.log("DDDDDDDDDDDDDDd", data)
    async.auto({
        getUserDataFromDB: (cb) => {
            if (!data.userId) {
                cb(null, { "statusCode": util.statusCode.ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }
            var criteria = {
                _id: data.userId,
                otp: data.otp,
            }
            userDAO.getUser(criteria, {}, {}, (err, dbData) => {
                if (err) {
                    cb(null, { "statusCode": util.statusCode.ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                    return;
                }
                if (dbData && dbData.length > 0) {
                    let present = parseInt(Date.now());
                    let limit = present - dbData[0].otpExpireTime;
                    console.log("MMMMMMMMMMMMMMMMMM", typeof limit, limit)
                    if (limit < 600000) {
                        // console.log("TTTTTTTTTTTTTTTTTTTTT");
                        cb(null, { result: dbData[0]._id });
                    } else {
                        cb(null, { "statusCode": util.statusCode.ONE, "statusMessage": util.statusMessage.LINK_EXPIRED });
                    }
                } else {
                    cb(null, { "statusCode": util.statusCode.FOUR, "statusMessage": util.statusMessage.NO_DATA });
                }
            })
        },
        verifiedLink: ['getUserDataFromDB', (functionData, cb) => {
            if (functionData.getUserDataFromDB && functionData.getUserDataFromDB.statusCode) {
                return cb(null, functionData.getUserDataFromDB);
            }
            let criteria = {
                _id: functionData.getUserDataFromDB.result
            }
            let dataToSet = {
                $set: {
                    otp: 0,
                    otpExpireTime: 0,
                    emailVerified: true
                }
            }
            userDAO.updateUser(criteria, dataToSet, {}, (err, result) => {
                if (err) {
                    cb(null, { "statusCode": util.statusCode.ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                    return;
                } else if (!result) {
                    cb(null, { "statusCode": util.statusCode.ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                    return;
                }
                else {
                    console.log("succesfully updated");
                    cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.DOC_UPDATED, result: result })
                }

            })
        }]
    }, (err, response) => {
        if (err) {
            callback(err)
        }
        callback(response.verifiedLink);
    })
}


let resetPassword = (data, callback) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            if (!data.userId || !data.password || !data.confirmPassword) {
                cb(null, { "statusCode": util.statusCode.ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }
            var criteria = {
                _id: data.userId,
                status: "ACTIVE",
                userType: "ADMIN"
            }
            userDAO.getUser(criteria, {}, {}, (err, dbData) => {
                if (err) {
                    cb(null, { "statusCode": util.statusCode.ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                    return;
                }

                if (dbData && dbData.length > 0) {
                    cb(null);
                } else {
                    console.log("KKKKKKKKKKKKKKK", criteria)
                    cb(null, { "statusCode": util.statusCode.NINE, "statusMessage": util.statusMessage.NO_DATA });
                }
            });
        },
        updatePasswordInDB: ['checkUserExistsinDB', (functionData, cb) => {
            if (functionData && functionData.checkUserExistsinDB && functionData.checkUserExistsinDB.statusCode) {
                cb(null, functionData.checkUserExistsinDB);
                return;
            }
            if (data.password != data.confirmPassword) {
                console.log("KKKKKKKKKKKKKKK")
                cb(null, { "statusCode": util.statusCode.NINE, "statusMessage": util.statusMessage.PASSWORD_NOT_MATCHED });
            }
            var criteria = {
                _id: data.userId,
                status: "ACTIVE",
                userType: "ADMIN"
                // isverified: true
            }
            var dataToSet = {
                $set: {
                    "password": util.encryptData(data.password)
                }
            }
            userDAO.updateUser(criteria, dataToSet, {}, function (err, dbData) {
                if (err) {
                    cb(null, { "statusCode": util.statusCode.ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                    return;
                }

                cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.PASSWORD_CHANGED })
            });
        }]
    }, (err, response) => {
        callback(response.updatePasswordInDB);
    });
}


let changePassword = (data, callback) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            if (!data.userId || !data.oldPassword || !data.password || !data.confirmPassword) {
                cb(null, { "statusCode": util.statusCode.ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }
            var criteria = {
                _id: data.userId,
                status: "ACTIVE",
                userType: "ADMIN"
            }
            userDAO.getUser(criteria, {}, {}, (err, dbData) => {
                if (err) {
                    cb(null, { "statusCode": util.statusCode.ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                    return;
                }

                if (dbData && dbData.length > 0) {
                    if (dbData[0].password == util.encryptData(data.oldPassword)) {
                        return cb(null);
                    }
                    return cb(null, { "statusCode": util.statusCode.NINE, "statusMessage": util.statusMessage.INCORRECT_PASSWORD });
                } else {
                    return cb(null, { "statusCode": util.statusCode.NINE, "statusMessage": util.statusMessage.NO_DATA });
                }
            });
        },
        updatePasswordInDB: ['checkUserExistsinDB', (functionData, cb) => {
            if (functionData && functionData.checkUserExistsinDB && functionData.checkUserExistsinDB.statusCode) {
                return cb(null, functionData.checkUserExistsinDB);

            }
            if (data.password != data.confirmPassword) {
                console.log("KKKKKKKKKKKKKKK")
                cb(null, { "statusCode": util.statusCode.NINE, "statusMessage": util.statusMessage.PASSWORD_NOT_MATCHED });
            }
            var criteria = {
                _id: data.userId,
                status: "ACTIVE",
                userType: "ADMIN"
                // isverified: true
            }
            var dataToSet = {
                $set: {
                    "password": util.encryptData(data.password)
                }
            }
            userDAO.updateUser(criteria, dataToSet, {}, function (err, dbData) {
                if (err) {
                    cb(null, { "statusCode": util.statusCode.ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                    return;
                }

                cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.PASSWORD_CHANGED })
            });
        }]
    }, (err, response) => {
        callback(response.updatePasswordInDB);
    });
}

let getProfile = (data, callback) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            if (!data.adminId) {

                cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }
            var criteria = {
                _id: data.adminId,
                status: "ACTIVE",
                verified: true
            }

            userDAO.getUser(criteria, {}, {}, (err, dbData) => {
                console.log(dbData, "post", err)

                if (err) {
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                    return;
                }

                if (dbData && dbData.length) {
                    cb(null, { result: dbData });
                }
                else {
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.NO_DATA });
                    return;
                }

            });
        },
        getUserDataFromDB: ['checkUserExistsinDB', (functionData, cb) => {
            console.log("just in users detail...", functionData.checkUserExistsinDB)
            if (functionData.checkUserExistsinDB && functionData.checkUserExistsinDB.statusCode) {
                cb(null, functionData.checkUserExistsinDB);
                return;
            }
            var data = {
                dbData: functionData.checkUserExistsinDB.result
            }
            cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.DATA_FETCHED, result: data })

        }]

    }, (err, response) => {
        callback(response.getUserDataFromDB)
    })
}

// groups api

let addGroup = (data, file, callback) => {
    // console.log("XXXXXXXXXXXXXXXXXXXXXX", file)
    async.auto({
        checkUserExistsinDB: (cb) => {
            if (!data.groupName || !data.groupType) {
                console.log("KKKKKKKKKKKKKK", data)
                cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }
            var criteria = {
                status: "ACTIVE",
                userType: "ADMIN",
                verified: true
            }

            userDAO.getUser(criteria, {}, {}, (err, dbData) => {
                console.log(dbData, "post", err)

                if (err) {
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                    return;
                }

                if (dbData && dbData.length) {
                    cb(null, { result: dbData });
                }
                else {
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.NO_DATA });
                    return;
                }

            });
        },
        createGroup: ['checkUserExistsinDB', (functionData, cb) => {
            if (functionData.checkUserExistsinDB && functionData.checkUserExistsinDB.statusCode) {
                cb(null, functionData.checkUserExistsinDB)
            } else {
                console.log("fsdfsdgdfhdgfh", functionData)
                var groupData = {
                    "createrId": functionData.checkUserExistsinDB.result[0]._id,
                    "groupMembers": {
                        "groupMember": functionData.checkUserExistsinDB.result[0]._id,
                    },
                    "groupName": data.groupName,
                    "groupType": data.groupType,
                    "groupPic": file.filename 
                }
                groupDAO.createGroup(groupData, (err, createdGroup) => {
                    if (err) {
                        cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY });
                        return;
                    } else {
                        cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.GROUP_CREATED, "groupData": createdGroup });
                    }
                })
            }
        }]
    }, (error, response) => {
        if (error) {
            l("Something went wrong", error)
            callback(error)
        }
        callback(response.createGroup)
    })
}


let updateGroup = (data, file, callback) => {
    async.auto({
        checkUserAndGroupExistsinDB: (cb) => {
            if (!data.groupId) {

                cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }
            var criteria = {
                status: "ACTIVE",
                userType: "ADMIN",
                verified: true
            }

            userDAO.getUser(criteria, {}, {}, (err, dbData) => {
                console.log(dbData, "post", err)

                if (err) {
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                    return;
                }

                if (dbData && dbData.length) {
                    let criteria = {
                        _id: data.groupId
                    }
                    groupDAO.getGroup(criteria, {}, {}, (err1, groupData) => {
                        if (err1) {
                            cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                            return;
                        } else if (groupData && groupData.length) {
                            let result = {
                                dbData: dbData[0],
                                groupData: groupData[0]
                            }
                            cb(null, { result: result });
                        } else {
                            cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.NO_DATA });
                            return;
                        }
                    })
                }
                else {
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.NO_DATA });
                    return;
                }

            });
        },
        updateGroup: ['checkUserAndGroupExistsinDB', (functionData, cb) => {
            if (functionData.checkUserAndGroupExistsinDB && functionData.checkUserAndGroupExistsinDB.statusCode) {
                cb(null, functionData.checkUserAndGroupExistsinDB)
            } else {
                let criteria = {
                    _id: data.groupId
                }
                let id = functionData.checkUserAndGroupExistsinDB.result.dbData._id
                let member = functionData.checkUserAndGroupExistsinDB.result.groupData.groupMembers
                let dataToSet = {
                    "createrId": id,
                    "groupMembers": member
                }
                console.log("YYYYYYYYYYYYYYYYYYYYYY", data, "NNNNNNNNNNNNNNNN", file)
                if (data.groupName) {
                    dataToSet.groupName = data.groupName
                }
                if (data.groupType) {
                    dataToSet.groupType = data.groupType
                }
                if(file){
                    if (file.filename) {
                    dataToSet.groupPic = file.filename
                }
            }
               
                if (data.groupStatus) {
                    dataToSet.groupStatus = data.groupStatus
                }
                console.log("suidfgikwadfksr", dataToSet)
                groupDAO.updateGroup(criteria, { $set: dataToSet }, {}, (err2, updatedGroup) => {
                    if (err2) {
                        cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                        return;
                    }
                    cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.GROUP_UPDATED, UpdatedGroup: updatedGroup })
                })
            }
        }]
    }, (error, response) => {
        if (error) {
            l("Something went wrong", error)
            callback(error)
        }
        callback(response.updateGroup)
    })
}


/**========================================================admin settings =================================================*/


let adminControls = (data,file, callback) => {
    console.log("LLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL", data ,file)
    async.auto({
        checkAdminExistsinDB: (cb) => {
            if (!data.adminId) {

                cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }
            var criteria = {
                _id: data.adminId,
                status: "ACTIVE",
                userType: "ADMIN",
                verified: true
            }

            userDAO.getUser(criteria, {}, {}, (err, dbData) => {
                console.log(dbData, "post", err)

                if (err) {
                    return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })

                }

                if (dbData && dbData.length) {
                    cb(null, { result: dbData[0] })
                }
                else {
                    return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.NO_DATA });

                }

            });
        },
        createOrUpdateAdminControl: ['checkAdminExistsinDB', (functionData, cb) => {
            if (functionData.checkAdminExistsinDB && functionData.checkAdminExistsinDB.statusCode) {
                return cb(null, functionData.checkAdminExistsinDB);
            } else {
                console.log("SSSSSSSSSSSSSSSSSSSSSSSSS", functionData)
                let criteria = {
                    _id: data.adminId
                }
                let dataToSet={
                    _id:data.adminId
                }
                if(data.fullName){
                    dataToSet.fullName=data.fullName
                }
                if(data.email){
                    dataToSet.email=data.email
                }
                if(data.phone){
                    dataToSet.phone=data.phone
                }
                console.log("DSWQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ",file)
                if(file){
                    if(file.filename){
                        dataToSet.image = file.filename
                    }
                }
                
                userDAO.updateUser(criteria, dataToSet, {}, (err2, updatedControls) => {
                    if (err2) {
                        console.log("Dasdfas", err2)
                        return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })

                    } else if (updatedControls == null) {
                        return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.UPDATE_FAILED })
                    }
                    console.log("UUUUUUUUUUUUUUUUUUU", updatedControls)
                    return cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.CONTROLS_UPDATED, UpdatedControls: updatedControls })
                })
            }
        }]
    }, (error, response) => {
        if (error) {
            l("Something went wrong", error)
            callback(error)
        }
        callback(response.createOrUpdateAdminControl)
    })
}

/** ==============================================================Events api====================================================================*/

let addEvent = (data, file, callback) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            if (!data.adminId || !data.eventName || !data.startDate) {

                cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }
            var criteria = {
                _id: data.adminId,
                status: "ACTIVE",
                userType: "ADMIN",
                verified: true
            }

            userDAO.getUser(criteria, {}, {}, (err, dbData) => {
                console.log(dbData, "post", err)

                if (err) {
                    console.log("dfsdjhgfkjdsga", err)
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                    return;
                }

                if (dbData && dbData.length) {
                    cb(null, { result: dbData[0] });
                }
                else {
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.NO_DATA });
                    return;
                }

            });
        },
        createEvent: ['checkUserExistsinDB', (functionData, cb) => {
            if (functionData.checkUserExistsinDB && functionData.checkUserExistsinDB.statusCode) {
                cb(null, functionData.checkUserExistsinDB)
            } else {
                console.log("fsdfsdgdfhdgfh", functionData)
                var start = new Date(data.startDate).getTime();
                // var end = new Date (data.endDate).getTime();
                var eventData = {
                    "createrId": functionData.checkUserExistsinDB.result._id,
                    "eventMembers": {
                        "eventMember": functionData.checkUserExistsinDB.result._id,
                    },
                    "eventName": data.eventName,
                    "eventPic": file.filename ,
                    "startDate": start - 19080000,
                    "endDate": start + 1800000
                }
                eventDAO.createEvent(eventData, (err, createdEvent) => {
                    if (err) {
                        console.log("dfsdjhgfkjdsga>>>>>>>>>>", err)
                        cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY });
                        return;
                    } else {
                        cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.EVENT_CREATED, "eventData": createdEvent });
                    }
                })
            }
        }]
    }, (error, response) => {
        if (error) {
            l("Something went wrong", error)
            callback(error)
        }
        callback(response.createEvent)
    })
}

let getEvents = (data, callback) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            
            var criteria = {
                status: "ACTIVE",
                userType: "ADMIN",
                verified: true
            }

            userDAO.getUser(criteria, {}, {}, (err, dbData) => {
                console.log(dbData, "post", err)

                if (err) {
                    console.log("dfsdjhgfkjdsga", err)
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                    return;
                }

                if (dbData && dbData.length) {
                    cb(null, { result: dbData[0] });
                }
                else {
                    cb(null, { "statusCode": util.statusCode.CREATED, "statusMessage": util.statusMessage.NO_DATA });
                    return;
                }

            });
        },
        getEvent: ['checkUserExistsinDB', (functionData, cb) => {
            if (functionData.checkUserExistsinDB && functionData.checkUserExistsinDB.statusCode) {
                cb(null, functionData.checkUserExistsinDB)
            } else {
                console.log("fsdfsdgdfhdgfh", functionData)
                // var today = new Date();
                // var start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0).getTime();
                var date = new Date();
                var now_utc =  Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
            0, 0, 0);
            let start = new Date (now_utc).getTime();
                // var end = new Date (data.endDate).getTime();
                let criteria = {
                    startDate:{
                        $gte:start
                    }
                }
                eventDAO.getEvent(criteria,{},{}, (err, event) => {
                    if (err) {
                        console.log("dfsdjhgfkjdsga>>>>>>>>>>", err)
                        cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY });
                        return;
                    } else {
                        cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.DATA_FETCHED, "eventData": event });
                    }
                })
            }
        }]
    }, (error, response) => {
        if (error) {
            l("Something went wrong", error)
            callback(error)
        }
        callback(response.getEvent)
    })
}


let updateEvent = (data, file, callback) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            if (!data.adminId) {

                cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }
            var criteria = {
                _id: data.adminId,
                status: "ACTIVE",
                userType: "ADMIN",
                verified: true
            }

            userDAO.getUser(criteria, {}, {}, (err, dbData) => {
                console.log(dbData, "post", err)

                if (err) {
                    cb(null, { "statusCode": util.statusCode.FIVE_ZERO_ZERO, "statusMessage": util.statusMessage.SERVER_BUSY })
                    return;
                }

                if (dbData && dbData.length) {
                    let criteria = {
                        _id: data.eventId
                    }
                    eventDAO.getEvent(criteria, {}, {}, (err1, eventData) => {
                        if (err1) {
                            cb(null, { "statusCode": util.statusCode.FIVE_ZERO_ZERO, "statusMessage": util.statusMessage.SERVER_BUSY })
                            return;
                        } else if (eventData && eventData.length) {
                            let result = {
                                dbData: dbData[0],
                                eventData: eventData[0]
                            }
                            cb(null, { result: result });
                        } else {
                            cb(null, { "statusCode": util.statusCode.CREATED, "statusMessage": util.statusMessage.NO_DATA });
                            return;
                        }
                    })
                }
                else {
                    cb(null, { "statusCode": util.statusCode.CREATED, "statusMessage": util.statusMessage.NO_DATA });
                    return;
                }

            });
        },
        updateEvent: ['checkUserExistsinDB', (functionData, cb) => {
            if (functionData.checkUserExistsinDB && functionData.checkUserExistsinDB.statusCode) {
                cb(null, functionData.checkUserExistsinDB)
            } else {
                let criteria = {
                    _id: data.eventId
                }
                let id = functionData.checkUserExistsinDB.result.dbData._id
                let member = functionData.checkUserExistsinDB.result.eventData.eventMembers
                let dataToSet = {
                    "createrId": id,
                    "eventMembers": member
                }
                if (data.eventName) {
                    dataToSet.eventName = data.eventName
                }
                if (data.eventType) {
                    dataToSet.eventStatus = data.eventStatus
                }
                if(file){
                    if (file.filename) {
                        dataToSet.eventPic = file.filename
                    }
                }
                
                
                console.log("sjagfukajsdgfkasdk", dataToSet)
                eventDAO.updateEvent(criteria, { $set: dataToSet }, {}, (err2, updatedEvent) => {
                    if (err2) {
                        cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                        return;
                    }
                    cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.Event_UPDATED, UpdatedEvent: updatedEvent })
                })
            }
        }]
    }, (error, response) => {
        if (error) {
            l("Something went wrong", error)
            callback(error)
        }
        callback(response.updateEvent)
    })
}

let howToUse = (data, file, callback) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            if (!data.adminId) {

                cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }
            var criteria = {
                _id: data.adminId,
                status: "ACTIVE",
                userType: "ADMIN",
                verified: true
            }

            userDAO.getUser(criteria, {}, {}, (err, dbData) => {
                console.log(dbData, "post", err)

                if (err) {
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                    return;
                }

                if (dbData && dbData.length) {
                    cb(null, { result: dbData[0] });
                }
                else {
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.NO_DATA });
                    return;
                }

            });
        },
        insertVideo: ['checkUserExistsinDB', (functionData, cb) => {
            if (functionData.checkUserExistsinDB && functionData.checkUserExistsinDB.statusCode) {
                cb(null, functionData.checkUserExistsinDB)
            } else {
                let data1 = {
                    createrId: functionData.checkUserExistsinDB.result._id,
                    link: data.link,
                    thumbnail: file.filename,
                    title: data.title
                }
                videoDAO.createVideo(data1, (err2, createdLink) => {
                    if (err2) {
                        cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                        return;
                    }
                    cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.DATA_UPDATED, createdLink: createdLink })
                })
            }
        }]
    }, (error, response) => {
        if (error) {
            l("Something went wrong", error)
            callback(error)
        }
        callback(response.insertVideo)
    })
}

let gethowToUse = (data, callback) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            
            var criteria = {
                status: "ACTIVE",
                userType: "ADMIN",
                verified: true
            }

            userDAO.getUser(criteria, {}, {}, (err, dbData) => {
                console.log(dbData, "post", err)

                if (err) {
                    cb(null, { "statusCode": util.statusCode.FIVE_ZERO_ZERO, "statusMessage": util.statusMessage.SERVER_BUSY })
                    return;
                }

                if (dbData && dbData.length) {
                    cb(null, { result: dbData[0] });
                }
                else {
                    cb(null, { "statusCode": util.statusCode.CREATED, "statusMessage": util.statusMessage.NO_DATA });
                    return;
                }

            });
        },
        getVideo: ['checkUserExistsinDB', (functionData, cb) => {
            if (functionData.checkUserExistsinDB && functionData.checkUserExistsinDB.statusCode) {
                cb(null, functionData.checkUserExistsinDB)
            } else {
                let criteria = {}
                let option = {
                    sort : {createdAt:-1}
                }
                videoDAO.getVideo(criteria,{},option, (err2, videos) => {
                    if (err2) {
                        cb(null, { "statusCode": util.statusCode.FIVE_ZERO_ZERO, "statusMessage": util.statusMessage.SERVER_BUSY })
                        return;
                    }
                    cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.DATA_UPDATED, videos: videos })
                })
            }
        }]
    }, (error, response) => {
        if (error) {
            l("Something went wrong", error)
            callback(error)
        }
        callback(response.getVideo)
    })
}

let updateHowToUse = (data, file, callback) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            if (!data.adminId) {

                cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }
            var criteria = {
                _id: data.adminId,
                status: "ACTIVE",
                userType: "ADMIN",
                verified: true
            }

            userDAO.getUser(criteria, {}, {}, (err, dbData) => {
                console.log(dbData, "post", err)

                if (err) {
                    cb(null, { "statusCode": util.statusCode.FIVE_ZERO_ZERO, "statusMessage": util.statusMessage.SERVER_BUSY })
                    return;
                }

                if (dbData && dbData.length) {
                    let criteria = {
                        _id: data.videoId
                    }
                    videoDAO.getOneVideo(criteria, (err1, videos) => {
                        if (err1) {
                            cb(null, { "statusCode": util.statusCode.FIVE_ZERO_ZERO, "statusMessage": util.statusMessage.SERVER_BUSY })
                            return;
                        } else if (videos ) {
                            let result = {
                                dbData: dbData[0],
                                videos: videos
                            }
                            cb(null, { result: result });
                        } else {
                            cb(null, { "statusCode": util.statusCode.CREATED, "statusMessage": util.statusMessage.NO_DATA });
                            return;
                        }
                    })
                }
                else {
                    cb(null, { "statusCode": util.statusCode.CREATED, "statusMessage": util.statusMessage.NO_DATA });
                    return;
                }

            });
        },
        updateVideo: ['checkUserExistsinDB', (functionData, cb) => {
            if (functionData.checkUserExistsinDB && functionData.checkUserExistsinDB.statusCode) {
                cb(null, functionData.checkUserExistsinDB)
            } else {
                let criteria = {
                    _id: data.videoId
                }
                let id = functionData.checkUserExistsinDB.result.dbData._id
                let dataToSet = {
                    "createrId": id
                }
                if (data.title) {
                    dataToSet.title = data.title
                }
                if (data.links) {
                    dataToSet.link = data.link
                }
                if(file){
                    if (file.filename) {
                        dataToSet.thumbnail = file.filename
                    }
                }
                
                
                console.log("sjagfukajsdgfkasdk", dataToSet)
                videoDAO.updateVideo(criteria, { $set: dataToSet }, {}, (err2, updatedVideo) => {
                    if (err2) {
                        cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                        return;
                    }
                    cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.Event_UPDATED, updatedVideo: updatedVideo })
                })
            }
        }]
    }, (error, response) => {
        if (error) {
            l("Something went wrong", error)
            callback(error)
        }
        callback(response.updatetipsNtricks)
    })
}


let tipsTricks = (data, file, callback) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            if (!data.adminId) {

                cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }
            var criteria = {
                status: "ACTIVE",
                userType: "ADMIN",
                verified: true
            }

            userDAO.getUser(criteria, {}, {}, (err, dbData) => {
                console.log(dbData, "post", err)

                if (err) {
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                    return;
                }

                if (dbData && dbData.length) {
                    cb(null, { result: dbData[0] });
                }
                else {
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.NO_DATA });
                    return;
                }

            });
        },
        insertTips: ['checkUserExistsinDB', (functionData, cb) => {
            if (functionData.checkUserExistsinDB && functionData.checkUserExistsinDB.statusCode) {
                cb(null, functionData.checkUserExistsinDB)
            } else {
                let data1 = {
                    createrId: functionData.checkUserExistsinDB.result._id,
                    image: file.filename,
                    title: data.title,
                    description: data.description,
                    url:data.url
                }
                tipsAndTricksDao.createtipsAndTricks(data1, (err2, createdTips) => {
                    if (err2) {
                        cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                        return;
                    }
                    cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.DATA_UPDATED, createdTips: createdTips })
                })
            }
        }]
    }, (error, response) => {
        if (error) {
            l("Something went wrong", error)
            callback(error)
        }
        callback(response.insertTips)
    })
}

let getTipsTricks = (data, callback) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            
            var criteria = {
                status: "ACTIVE",
                userType: "ADMIN",
                verified: true
            }

            userDAO.getUser(criteria, {}, {}, (err, dbData) => {
                console.log(dbData, "post", err)

                if (err) {
                    cb(null, { "statusCode": util.statusCode.FIVE_ZERO_ZERO, "statusMessage": util.statusMessage.SERVER_BUSY })
                    return;
                }

                if (dbData && dbData.length) {
                    cb(null, { result: dbData[0] });
                }
                else {
                    cb(null, { "statusCode": util.statusCode.CREATED, "statusMessage": util.statusMessage.NO_DATA });
                    return;
                }

            });
        },
        getTips: ['checkUserExistsinDB', (functionData, cb) => {
            if (functionData.checkUserExistsinDB && functionData.checkUserExistsinDB.statusCode) {
                cb(null, functionData.checkUserExistsinDB)
            } else {
                let criteria = {}
                let option = {
                    sort : {createdAt:-1}
                }
                tipsAndTricksDao.gettipsAndTricks(criteria,{},option, (err2, tipsAndTricks) => {
                    if (err2) {
                        cb(null, { "statusCode": util.statusCode.FIVE_ZERO_ZERO, "statusMessage": util.statusMessage.SERVER_BUSY })
                        return;
                    }
                    cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.DATA_UPDATED, tipsAndTricks: tipsAndTricks })
                })
            }
        }]
    }, (error, response) => {
        if (error) {
            l("Something went wrong", error)
            callback(error)
        }
        callback(response.getTips)
    })
}

let updateTipsTricks = (data, file, callback) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            if (!data.adminId) {

                cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }
            var criteria = {
                _id: data.adminId,
                status: "ACTIVE",
                userType: "ADMIN",
                verified: true
            }

            userDAO.getUser(criteria, {}, {}, (err, dbData) => {
                console.log(dbData, "post", err)

                if (err) {
                    cb(null, { "statusCode": util.statusCode.FIVE_ZERO_ZERO, "statusMessage": util.statusMessage.SERVER_BUSY })
                    return;
                }

                if (dbData && dbData.length) {
                    let criteria = {
                        _id: data.tipId
                    }
                    tipsAndTricksDao.getOnetipsAndTricks(criteria, (err1, tips) => {
                        if (err1) {
                            cb(null, { "statusCode": util.statusCode.FIVE_ZERO_ZERO, "statusMessage": util.statusMessage.SERVER_BUSY })
                            return;
                        } else if (tips) {
                            let result = {
                                dbData: dbData[0],
                                tips: tips
                            }
                            cb(null, { result: result });
                        } else {
                            cb(null, { "statusCode": util.statusCode.CREATED, "statusMessage": util.statusMessage.NO_DATA });
                            return;
                        }
                    })
                }
                else {
                    cb(null, { "statusCode": util.statusCode.CREATED, "statusMessage": util.statusMessage.NO_DATA });
                    return;
                }

            });
        },
        updatetipsNtricks: ['checkUserExistsinDB', (functionData, cb) => {
            if (functionData.checkUserExistsinDB && functionData.checkUserExistsinDB.statusCode) {
                cb(null, functionData.checkUserExistsinDB)
            } else {
                let criteria = {
                    _id: data.tipId
                }
                let id = functionData.checkUserExistsinDB.result.dbData._id
                let dataToSet = {
                    "createrId": id
                }
                if (data.title) {
                    dataToSet.title = data.title
                }
                if (data.description) {
                    dataToSet.description = data.description
                }
                if (data.url) {
                    dataToSet.url = data.url
                }
                if(file){
                    if (file.filename) {
                        dataToSet.image = file.filename
                    }
                }
                
                
                console.log("sjagfukajsdgfkasdk", dataToSet)
                tipsAndTricksDao.updatetipsAndTricks(criteria, { $set: dataToSet }, {}, (err2, updatedTips) => {
                    if (err2) {
                        cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                        return;
                    }
                    cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.Event_UPDATED, updatedTips: updatedTips })
                })
            }
        }]
    }, (error, response) => {
        if (error) {
            l("Something went wrong", error)
            callback(error)
        }
        callback(response.updatetipsNtricks)
    })
}

let getAllUsers = (data, callback) => {
    async.auto({
        checkUserExistsinDB: (cb) => {

            var criteria = {
                status: "ACTIVE",
                userType: "ADMIN",
                verified: true
            }

            userDAO.getUser(criteria, {}, {}, (err, dbData) => {
                console.log(dbData, "post", err)

                if (err) {
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                    return;
                }

                if (dbData && dbData.length) {
                    cb(null, { result: dbData[0] });
                }
                else {
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.NO_DATA });
                    return;
                }

            });
        },
        getAllUsersInDB: ['checkUserExistsinDB', (functionData, cb) => {
            if (functionData.checkUserExistsinDB && functionData.checkUserExistsinDB.statusCode) {
                cb(null, functionData.checkUserExistsinDB)
            } else {
                let criteria1 = {
                    userType: { $ne: "ADMIN" }
                }
                let option = {
                    sort: { createdAt: -1 }
                }
                userDAO.getUser(criteria1, { fullName: 1, email: 1, mergedContact: 1, status: 1 }, option, (err, paginateData) => {
                    if (err) {
                        cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                        return;
                    }
                    if (paginateData.length == 0) {
                        cb(null, { "statusCode": util.statusCode.Nine, "statusMessage": util.statusMessage.NO_DATA })
                    }
                    cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.DATA_UPDATED, users: paginateData })
                })
            }
        }]
    }, (error, response) => {
        callback(response.getAllUsersInDB)
    })
}

let getQueries = (data, callback) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            if (!data.adminId) {

                cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }
            var criteria = {
                _id: data.adminId,
                status: "ACTIVE",
                userType: "ADMIN",
                verified: true
            }

            userDAO.getUser(criteria, {}, {}, (err, dbData) => {
                console.log(dbData, "post", err)

                if (err) {
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                    return;
                }

                if (dbData && dbData.length) {
                    cb(null, { result: dbData[0] });
                }
                else {
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.NO_DATA });
                    return;
                }

            });
        },
        getAllUsersInDB: ['checkUserExistsinDB', (functionData, cb) => {
            if (functionData.checkUserExistsinDB && functionData.checkUserExistsinDB.statusCode) {
                cb(null, functionData.checkUserExistsinDB)
            } else {
                let criteria1 = {}
                let option = {
                    sort: { createdAt: -1 }
                }
                contactUsDAO.getcontactUs(criteria1, {}, option, (err1, result1) => {
                    if (err) {
                        cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                    }
                    cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.DATA_FETCHED, contactUsData: result1 })
                })
            }
        }]
    }, (error, response) => {
        callback(response.getAllUsersInDB)
    })
}

let addRules = (data, callback) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            if (!data.adminId || !data.rule) {

                cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }
            var criteria = {
                _id: data.adminId,
                status: "ACTIVE",
                userType: "ADMIN"
            }

            userDAO.getUser(criteria, {}, {}, (err, dbData) => {
                console.log(dbData, "post", err)

                if (err) {
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                    return;
                }

                if (dbData && dbData.length) {
                    cb(null, { result: dbData[0] });
                }
                else {
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.NO_DATA });
                    return;
                }

            });
        },
        createRule: ['checkUserExistsinDB', (functionData, cb) => {
            if (functionData.checkUserExistsinDB && functionData.checkUserExistsinDB.statusCode) {
                return cb(null, functionData.checkUserExistsinDB)
            } else {
                let objToCreate = {
                    rule: data.rule
                }
                rulesAndRegulationDAO.createRules(objToCreate, (err, created) => {
                    if (err) {
                        cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                        return;
                    }
                    cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.CREATED_DOC, rules: created })
                })
            }
        }]
    }, (error, response) => {
        callback(response.createRule)
    })
}

let updateRules = (data, callback) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            if (!data.adminId || !data.rule) {

                cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }
            var criteria = {
                _id: data.adminId,
                status: "ACTIVE",
                userType: "ADMIN"
            }

            userDAO.getUser(criteria, {}, {}, (err, dbData) => {
                console.log(dbData, "post", err)

                if (err) {
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                    return;
                }

                if (dbData && dbData.length) {
                    cb(null, { result: dbData[0] });
                }
                else {
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.NO_DATA });
                    return;
                }

            });
        },
        updateRule: ['checkUserExistsinDB', (functionData, cb) => {
            if (functionData.checkUserExistsinDB && functionData.checkUserExistsinDB.statusCode) {
                return cb(null, functionData.checkUserExistsinDB)
            } else {
                let criteria = {
                    _id: ruleId,
                    userType: "ADMIN"
                }
                let objToUpdate = {
                    rule: data.rule
                }
                rulesAndRegulationDAO.updateRules(criteria, objToUpdate, {}, (err, updated) => {
                    if (err) {
                        cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                        return;
                    }
                    cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.DOC_UPDATED, rules: updated })
                })
            }
        }]
    }, (error, response) => {
        callback(response.updateRule)
    })
}

let getAllGroups = (data, callback) => {
    async.auto({
        checkUserExistsinDB: (cb) => {

            var criteria = {
                status: "ACTIVE",
                userType: "ADMIN"
            }

            userDAO.getUser(criteria, {}, {}, (err, dbData) => {
                console.log(dbData, "post", err)

                if (err) {
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                    return;
                }

                if (dbData && dbData.length) {
                    cb(null, { result: dbData[0] });
                }
                else {
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.NO_DATA });
                    return;
                }

            });
        },
        getAllGroups: ['checkUserExistsinDB', (functionData, cb) => {
            if (functionData.checkUserExistsinDB && functionData.checkUserExistsinDB.statusCode) {
                return cb(null, functionData.checkUserExistsinDB)
            } else {
                let criteria = {}
                groupDAO.getGroup(criteria, {}, { sort: { createdAt: -1 } }, (err, updated) => {
                    if (err) {
                        cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                        return;
                    }
                    cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.DOC_UPDATED, groups: updated })
                })
            }
        }]
    }, (error, response) => {
        callback(response.getAllGroups)
    })
}

cron.schedule("59 59 23 * * *", function () {
    // cron.schedule("* * * * * *", function () {
    console.log("running a task every mid-night at 23:59:59");
    var criteria = {
        status: "ACTIVE",
        userType: "ADMIN"
    }

    userDAO.getUser(criteria, {}, {}, (err, dbData) => {
        console.log(dbData, "post", err)

        if (err) {
            console.log("Error in creating events", err)
        }

        if (dbData && dbData.length) {
            // var start = new Date().getTime();
            // var date = 
            var date = new Date(); 
            // var now_utc =  Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
            // date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
            var now_utc =  Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
            0, 0, 0);
            let start = new Date (now_utc).getTime();
            start = start + 1000;
            var eventData = {
                "createrId": dbData[0]._id,
                "eventMembers": {
                    "eventMember": dbData[0]._id,
                },
                "eventName": "Morning 8:00 AM",
                "eventPic": "d8ddc5fb26a4d7a5c2d2acdca4e0b67d1577686394711.jpeg",
                "coverPic": "e04fe2ef7c3c321e1e7ce7cca9427a811574083799143.jpeg",
                "startDate": start + 28800000,
                "endDate": start + 30600000
            }
            var eventData2 = {
                "createrId": dbData[0]._id,
                "eventMembers": {
                    "eventMember": dbData[0]._id,
                },
                "eventName": "Afternoon 12:00 PM",
                "eventPic": "5a5ac20cee14396884cdf8ac2576e5451574317082938.jpeg",
                "coverPic": "5c7d9ef12fbe7393e1b394d9b3b6d1b61574083759218.png",
                "startDate": start + 43200000,
                "endDate": start + 45000000
            }
            var eventData3 = {
                "createrId": dbData[0]._id,
                "eventMembers": {
                    "eventMember": dbData[0]._id,
                },
                "eventName": "Evening 8:00PM",
                "eventPic": "3139937449da71ec160e7c097a0ef8cf1577683622368.jpeg",
                "coverPic": "a3e23ce75948b7fc7741832b9a9821601574083735900.jpeg",
                "startDate": start + 72000000,
                "endDate": start + 73800000
            }
            const arr = [eventData, eventData2, eventData3]
            eventDAO.createMultipleEvent(arr, (err, createdEvent) => {
                if (err) {
                    console.log("Error in creating events in db", err)
                } else {
                    console.log("events created successfully in db", createdEvent)
                }
            })

        }
        else {
            console.log("Admin not found")
        }

    });


});


cron.schedule("* * * * *", function () {
    // cron.schedule("* * * * * *", function () {
    console.log("running a task every 2 minutes");
    let comparisonMinutes = new Date().getTime();
    let current = new Date().getTime();
    current = current + 600000;
    let halhHours = current + 600000;
    let criteria = {
        startDate:
        {
            $gte: current,
            $lte: halhHours
        }
    }
    eventDAO.getEvent(criteria, {}, {}, (err, result) => {
        console.log("DEtails of events are here", err, result)
        if (err) {
            console.log("Error while fetching detail")
        }
        if (result.length == 0) {
            console.log("event is far away")
        }
        if (result.length) {
            let event = result[0];
            if(event.eventMembers.length==0){
                console.log("no members to send message")
            }
            else{
                
                let member = []
                for (let i = 1; i < event.eventMembers.length; i++) {
                    member.push(event[i].eventMember)
                }
                let criteria1 = {
                    _id: { $in: member },
                    status: "ACTIVE"
                }
                userDAO.getUser(criteria1, {}, {}, (err, result1) => {
                    if (err) {
    
                        console.log("Error while fetching users detail")
                    }
                    if (result1.length == 0) {
                        console.log("no members till now for this event")
                    }
                    if (result.length) {
                        let deviceTokens = []
                        for (let i = 0; i < result1.length; i++) {
                            if (result1[i].deviceToken) {
                                deviceTokens.push(result1[i].deviceToken)
                            }
                        }
                        let millisec = 60000;
                        comparisonMinutes = result[0].startDate - comparisonMinutes
                        comparisonMinutes = comparisonMinutes / millisec;
                        if (comparisonMinutes == 10 || comparisonMinutes == 6 || comparisonMinutes == 2) {
                            var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
                                registration_ids: deviceTokens,
                                collapse_key: 'green',
    
                                notification: {
                                    title: `${event.eventName} event is going to start in ${comparisonMinutes} minutes`,
                                    body: `${event.eventName} event in which you are a member is going to start in ${comparisonMinutes} minutes
                                        please get ready to post your instagram url's as it will be open for 1/2 hour`
                                },
    
                                // data: {  //you can send only notification or only data(or include both)
                                //     my_key: 'my value',
                                //     my_another_key: 'my another value'
                                // }
                            };
    
                            fcm.send(message, function (err, response) {
                                if (err) {
                                    console.log("Something has gone wrong!");
                                } else {
                                    console.log("Successfully sent with response: ", response);
                                }
                            });
                        }
    
                        if (comparisonMinutes == 0) {
                            var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
                                registration_ids: deviceTokens,
                                collapse_key: 'green',
    
                                notification: {
                                    title: `${event.eventName} event has been started.`,
                                    body: `${event.eventName} event has been started and now you can drop your urls`
                                },
    
                                // data: {  //you can send only notification or only data(or include both)
                                //     my_key: 'my value',
                                //     my_another_key: 'my another value'
                                // }
                            };
    
                            fcm.send(message, function (err, response) {
                                if (err) {
                                    console.log("Something has gone wrong!");
                                } else {
                                    console.log("Successfully sent with response: ", response);
                                }
                            });
                        }
                    }
    
                })
            }
        }


    })
});

let updateUser = (data , callback) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            if (!data.userId) {

                cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }
            var criteria = {
                status: "ACTIVE",
                userType: "ADMIN",
                verified: true
            }

            userDAO.getUser(criteria, {}, {}, (err, dbData) => {
                console.log(dbData, "post", err)

                if (err) {
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                    return;
                }

                if (dbData && dbData.length) {
                   cb(null)
                }
                else {
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.NO_DATA });
                    return;
                }

            });
        },
        updateUser: ['checkUserExistsinDB', (functionData, cb) => {
            if (functionData.checkUserExistsinDB && functionData.checkUserExistsinDB.statusCode) {
                cb(null, functionData.checkUserExistsinDB)
            } else {
                let criteria = {
                    _id: data.userId
                }
                let dataToSet = {
                    "_id": data.userId
                }
                if (data.status) {
                    dataToSet.status = data.status
                }
                console.log("suidfgikwadfksr", dataToSet)
                userDAO.updateUser(criteria, { $set: dataToSet }, {}, (err2, updatedUser) => {
                    if (err2) {
                        return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                        
                    }
                    cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.GROUP_UPDATED, updatedUser: updatedUser })
                })
            }
        }]
    }, (error, response) => {
        if (error) {
            l("Something went wrong", error)
            callback(error)
        }
        callback(response.updateUser)
    })
}

let createRewards = (data , callback) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            
            var criteria = {
                status: "ACTIVE",
                userType: "ADMIN",
                verified: true
            }

            userDAO.getUser(criteria, {}, {}, (err, dbData) => {
                console.log(dbData, "post", err)

                if (err) {
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                    return;
                }

                if (dbData && dbData.length) {
                   cb(null)
                }
                else {
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.NO_DATA });
                    return;
                }

            });
        },
        createReward: ['checkUserExistsinDB', (functionData, cb) => {
            if (functionData.checkUserExistsinDB && functionData.checkUserExistsinDB.statusCode) {
                cb(null, functionData.checkUserExistsinDB)
            } else {
                let obj1 ={
                    userType:"ADMIN",
                    rewardType:data.rewardType,
                    rewardPoint:data.rewardPoint
                }
                
                
                rewardsDAO.createRewards(obj1,(err,result)=>{
                    if (err) {
                        cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                        return;
                    }
                    cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.GROUP_UPDATED, createdRewards: result })
                })
            }
        }]
    }, (error, response) => {
        if (error) {
            l("Something went wrong", error)
            callback(error)
        }
        callback(response.createReward)
    })
}

let updateRewards = (data , callback) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            console.log("WWWWWWWWWWWWWWWWW",data)
            if (!data.rewardPoint || !data.rewardId || !data.adminId) {

                cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }
            var criteria = {
                status: "ACTIVE",
                userType: "ADMIN",
                verified: true
            }

            userDAO.getUser(criteria, {}, {}, (err, dbData) => {
                console.log(dbData, "post", err)

                if (err) {
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                    return;
                }

                if (dbData && dbData.length) {
                   cb(null)
                }
                else {
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.NO_DATA });
                    return;
                }

            });
        },
        updateReward: ['checkUserExistsinDB', (functionData, cb) => {
            if (functionData.checkUserExistsinDB && functionData.checkUserExistsinDB.statusCode) {
                cb(null, functionData.checkUserExistsinDB)
            } else {
                let criteria = {
                    userType:"ADMIN",
                    _id:data.rewardId
                }
                let dataToSet = {
                     rewardPoint:data.rewardPoint
                }
                console.log("suidfgikwadfksr", dataToSet)
                rewardsDAO.updateRewards(criteria, { $set: dataToSet }, {}, (err2, updatedReward) => {
                    if (err2) {
                        cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                        return;
                    }
                    cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.DATA_UPDATED, updatedReward: updatedReward })
                })
            }
        }]
    }, (error, response) => {
        if (error) {
            l("Something went wrong", error)
            callback(error)
        }
        callback(response.updateReward)
    })
}

let getRewards = (data , callback) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            var criteria = {
                status: "ACTIVE",
                userType: "ADMIN",
                verified: true
            }

            userDAO.getUser(criteria, {}, {}, (err, dbData) => {
                console.log(dbData, "post", err)

                if (err) {
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                    return;
                }

                if (dbData && dbData.length) {
                   cb(null)
                }
                else {
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.NO_DATA });
                    return;
                }

            });
        },
        getReward: ['checkUserExistsinDB', (functionData, cb) => {
            if (functionData.checkUserExistsinDB && functionData.checkUserExistsinDB.statusCode) {
                cb(null, functionData.checkUserExistsinDB)
            } else {
                let criteria = {
                    userType:"ADMIN"
                }
                rewardsDAO.getRewards(criteria, {}, {sort:{createdAt:-1}}, (err2, Reward) => {
                    if (err2) {
                        cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                        return;
                    }
                    else if(Reward.length==0){
                        cb(null, { "statusCode": util.statusCode.CREATED, "statusMessage": util.statusMessage.NO_DATA })
                        return;
                    }
                    else
                    cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.GROUP_UPDATED, Reward: Reward })
                })
            }
        }]
    }, (error, response) => {
        if (error) {
            l("Something went wrong", error)
            callback(error)
        }
        console.log("DDDDDDDDDDDDDDDd",response)
        callback(response.getReward)
    })
}

let createRewardsCard = (data , file, callback) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            
            var criteria = {
                status: "ACTIVE",
                userType: "ADMIN",
                verified: true
            }

            userDAO.getUser(criteria, {}, {}, (err, dbData) => {
                console.log(dbData, "post", err)

                if (err) {
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                    return;
                }

                if (dbData && dbData.length) {
                   cb(null)
                }
                else {
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.NO_DATA });
                    return;
                }

            });
        },
        createRewardsCard: ['checkUserExistsinDB', (functionData, cb) => {
            if (functionData.checkUserExistsinDB && functionData.checkUserExistsinDB.statusCode) {
                cb(null, functionData.checkUserExistsinDB)
            } else {
                console.log("RTTTTTTTTTTTTTTRRRRRRRRRRRRRRRR",data.date)
                let valid = new Date(data.date).toDateString();
                let today =new Date(data.date)
                var now = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999).getTime();
                // let timeStamp = new Date(valid).getTime();
                console.log("AAAAAAAAAAAAAAAAAWWWWWWWWWWWWWWWW",now)
                let obj1 ={
                    userType:"ADMIN",
                    heading:data.heading,
                    rewardPoint:data.rewardPoint,
                    validity:valid,
                    timeStamp:now
                }
                if(file){
                    if(file.filename){
                        obj1.image=file.filename
                    }
                }
                
                
                rewardsCardDAO.createRewardsCard(obj1,(err,result)=>{
                    if (err) {
                        console.log("FFFFFFFFFFFFFFFFf",err)
                        cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                        return;
                    }
                    cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.GROUP_UPDATED, createdRewardsCard: result })
                })
            }
        }]
    }, (error, response) => {
        if (error) {
            l("Something went wrong", error)
            callback(error)
        }
        callback(response.createRewardsCard)
    })
}

let getRewardsCard = (data , callback) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            
            var criteria = {
                status: "ACTIVE",
                userType: "ADMIN",
                verified: true
            }

            userDAO.getUser(criteria, {}, {}, (err, dbData) => {
                console.log(dbData, "post", err)

                if (err) {
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                    return;
                }

                if (dbData && dbData.length) {
                   cb(null)
                }
                else {
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.NO_DATA });
                    return;
                }

            });
        },
        getRewardsCard: ['checkUserExistsinDB', (functionData, cb) => {
            if (functionData.checkUserExistsinDB && functionData.checkUserExistsinDB.statusCode) {
                cb(null, functionData.checkUserExistsinDB)
            } else {
                let criteria ={
                    userType:"ADMIN"
                }
                let option = {
                    sort:{createdAt:-1}
                }
                
                rewardsCardDAO.getRewardsCard(criteria,{},option,(err,result)=>{
                    if (err) {
                        console.log("FFFFFFFFFFFFFFFFf",err)
                        cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                        return;
                    }
                    if(result.length==0){
                        cb(null, { "statusCode": util.statusCode.CREATED, "statusMessage": util.statusMessage.NO_DATA })
                        return;
                    }
                    cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.DATA_FETCHED, result: result })
                })
            }
        }]
    }, (error, response) => {
        if (error) {
            l("Something went wrong", error)
            callback(error)
        }
        callback(response.getRewardsCard)
    })
}

let updateRewardsCard = (data , file, callback) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            if (!data.rewardCardId) {

                cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }
            var criteria = {
                status: "ACTIVE",
                userType: "ADMIN",
                verified: true
            }

            userDAO.getUser(criteria, {}, {}, (err, dbData) => {
                console.log(dbData, "post", err)

                if (err) {
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                    return;
                }

                if (dbData && dbData.length) {
                   cb(null)
                }
                else {
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.NO_DATA });
                    return;
                }

            });
        },
        updateRewardsCard: ['checkUserExistsinDB', (functionData, cb) => {
            if (functionData.checkUserExistsinDB && functionData.checkUserExistsinDB.statusCode) {
                cb(null, functionData.checkUserExistsinDB)
            } else {
                let criteria = {
                    userType:"ADMIN",
                    _id:data.rewardCardId
                }
                let dataToSet ={
                    userType:"ADMIN"
                }
                if(data.heading){
                    dataToSet.heading = data.heading;
                }
                if(data.rewardPoint){
                    dataToSet.rewardPoint=data.rewardPoint
                }
                if(data.validity){
                    let valid = new Date(data.date).toDateString();
                    let today =new Date(data.date)
                    var now = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999).getTime();
                    dataToSet.timeStamp=now;
                    dataToSet.validity=valid;
                }
                if(file){
                    if(file.filename){
                        dataToSet.image = file.filename
                    }
                }
                
                
                rewardsCardDAO.updateRewardsCard(criteria,dataToSet,{},(err,result)=>{
                    if (err) {
                        console.log("FFFFFFFFFFFFFFFFf",err)
                        cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                        return;
                    }
                    cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.DATA_UPDATED, result: result })
                })
            }
        }]
    }, (error, response) => {
        if (error) {
            l("Something went wrong", error)
            callback(error)
        }
        callback(response.updateRewardsCard)
    })
}


module.exports = {
    login: login,
    dashboard: dashboard,
    forgotPassword: forgotPassword,
    verifyForgotPasswordLink: verifyForgotPasswordLink,
    resetPassword: resetPassword,
    changePassword: changePassword,
    getProfile: getProfile,
    addGroup: addGroup,
    updateGroup: updateGroup,
    adminControls: adminControls,
    addEvent: addEvent,
    updateEvent: updateEvent,
    howToUse: howToUse,
    tipsTricks: tipsTricks,
    addRules: addRules,
    updateRules: updateRules,
    getAllUsers: getAllUsers,
    getQueries: getQueries,
    getAllGroups : getAllGroups,
    updateUser : updateUser,
    createRewards:createRewards,
    updateRewards:updateRewards,
    getRewards:getRewards,
    createRewardsCard:createRewardsCard,
    getRewardsCard:getRewardsCard,
    updateRewardsCard:updateRewardsCard,
    getEvents:getEvents,
    getTipsTricks:getTipsTricks,
    updateTipsTricks:updateTipsTricks,
    gethowToUse:gethowToUse,
    updateHowToUse:updateHowToUse
}