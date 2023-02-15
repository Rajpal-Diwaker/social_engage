let async = require('async'),
    util = require('../Utilities/util'),
    userDAO = require('../DAO/userDAO'),
    groupDAO = require('../DAO/groupDAO'),
    eventDAO = require('../DAO/eventDAO'),
    videoDAO = require('../DAO/videoDAO'),
    rewardsCardDAO = require('../DAO/rewardsCard'),
    rewardsDAO = require('../DAO/rewardDAO'),
    contactUsDAO = require('../DAO/contactUsDAO'),
    tipsAndTricksDAO = require('../DAO/tipsAndTricksDAO'),
    instaLinksDAO = require('../DAO/instaLinksDAO'),
    instaLinksEventsDAO = require('../DAO/instaLinksInEventsDAO'),
    warningDAO = require('../DAO/warningsDAO'),
    hashTagDAO = require('../DAO/hashTagDAO'),
    instaUserDetailDAO = require('../DAO/instaUserDetailDAO'),
    instagramUserDao = require('../DAO/instagramDAO'),
    rulesAndRegulationDAO = require('../DAO/rulesAndRegulationDAO'),

    mongoose = require('mongoose'),
    config = require("../Utilities/config").config,
    jwt = require('jsonwebtoken'),
    cron = require('node-cron'),
    botFunction = require("../Utilities/botFuntions"),
    l = console.log;


let signup = (data, callback) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            if (!data.phone || !data.password || !data.email || !data.countryCode) {

                cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }

            var criteria = {
                $or: [
                    {
                      mergedContact: data.countryCode + data.phone
                    },

                    {
                        email: data.email
                    }
                ]
            }

            userDAO.getUser(criteria, {}, {}, (err, dbData) => {
                if (err) {
                    cb(null, { "statusCode": util.statusCode.FIVE_ZERO_ZERO, "statusMessage": util.statusMessage.SERVER_BUSY })
                    return;
                }

                if (dbData && dbData.length) {

                    if (dbData[0].email == data.email) {
                        return cb(null, { "statusCode": util.statusCode.CREATED, "statusMessage": util.statusMessage.EMAIL_ALREADY_REGISTERED })
                    }

                    let checkPhone = data.countryCode + data.phone

                    if (dbData[0].mergedContact == checkPhone) {
                        return cb(null, { "statusCode": util.statusCode.CREATED, "statusMessage": util.statusMessage.PHONE_ALREADY_REGISTERED })
                    };

                }
                else {
                    console.log("DSDFFGHJHGFDFGHJJHGFDS",data)
                    if(data.referralCode){
                        let criteria ={
                            referralCode:data.referralCode
                        }

                        userDAO.getOneUser(criteria,(err,result)=>{
                            console.log("SERDFASFGDFVSCVCBGF",result)
                            if(err){
                               return cb(null, { "statusCode": util.statusCode.FIVE_ZERO_ZERO, "statusMessage": util.statusMessage.SERVER_BUSY })
                            }
                            else if (!result){
                                return cb(null, { "statusCode": util.statusCode.NINE, "statusMessage": util.statusMessage.NO_DATA });
                            }
                            else{
                                // rewardsDAO.getRewards({rewardType:"SIGNUP"},(err,result)=>{
                                //     if(err){
                                //         console.log("hfhdgfjkdfs",err)
                                //     }
                                //     else{

                                //     }
                                // })
                                cb(null,{referral:result}); 
                            }
                        })
                    }
                    else{
                        console.log("WWWWWWWWWWWWWWWWWWQQQQQQQQQQQ")
                        cb(null,{referral:[]});
                    }

                }

            });
        },

        createUserinDB: ['checkUserExistsinDB', (functionData, cb) => {
            if (functionData.checkUserExistsinDB && functionData.checkUserExistsinDB.statusCode) {
                cb(null, functionData.checkUserExistsinDB);
                return;
            }
            
            if(functionData.checkUserExistsinDB.referral.length>0){

                let previous = functionData.checkUserExistsinDB.referral;
                let referralCode = util.randomString(6);
                let otp = Math.floor(100000 + Math.random() * 900000)
                otp = Math.abs(otp)
                var userData = {
                    "phone": data.phone,
                    "gender": data.gender,
                    "email": data.email,
                    "otp": otp,
                    "otpExpireTime": Date.now(),
                    "countryCode": data.countryCode,
                    "mergedContact": data.countryCode + data.phone,
                    "password": util.encryptData(data.password),
                    "referralCode":referralCode,
                    "bonusReferralCode":previous.referralCode
                }
                
                userDAO.createUser(userData, async (err, dbData) => {
    
                    if (err) {
                        cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY });
                        return;
                    }
                    // let link = config.NODE_SERVER_URL.url + ":" + config.NODE_SERVER_PORT.port + "/user/verify-email-link?userId=" + dbData._id + "&otp=" + otp;
                    // await util.sendEmailVerificationMail({ "email": dbData.email, "OTP": otp, "link": link });
                    await util.smsSender(dbData.mergedContact, otp);

                    let link = config.NODE_SERVER_URL.url + ":" + config.NODE_SERVER_PORT.port + "/user/verify-email-link?email=" + data.email + "&otp=" + otp;
                    util.sendEmailVerificationMail({ "email": data.email, "OTP": otp, "link": link });
                    rewardsDAO.getRewards({rewardType:"INVITE"},{},{},(err1,result1)=>{
                        if(err1){
                            console.log("somehing went wrong")
                        }
                        userDAO.getOneUser({referralCode:previous.referralCode},(err3,result3)=>{
                            if(err){
                                console.log("wrong in getting detail")
                            }
                            let bonus = result3.rewardPoint;
                            bonus = bonus+result1.rewardPoint;
                            userDAO.updateUser({referralCode:previous.referralCode},{$set:{rewardPoint:bonus}},{},(err4,result4)=>{
                                if(err4){
                                    console.log("got wrong in 134")
                                }
                                console.log("successfully>>>>>>>>>>>>>>>>>>>",result4)
                            })
                        })
                    })
                    cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.OTP_VERIFY, "result": dbData._id });
                });    
            }
            else {
            
            let referralCode = util.randomString(6);
            let otp = Math.floor(100000 + Math.random() * 900000)
            otp = Math.abs(otp)
            var userData = {
                "phone": data.phone,
                "gender": data.gender,
                "email": data.email,
                "otp": otp,
                "otpExpireTime": Date.now(),
                "countryCode": data.countryCode,
                "mergedContact": data.countryCode + data.phone,
                "password": util.encryptData(data.password),
                "referralCode":referralCode
            }

            userDAO.createUser(userData, async (err, dbData) => {

                if (err) {
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY });
                    return;
                }
                // let link = config.NODE_SERVER_URL.url + ":" + config.NODE_SERVER_PORT.port + "/user/verify-email-link?userId=" + dbData._id + "&otp=" + otp;
                // await util.sendEmailVerificationMail({ "email": dbData.email, "OTP": otp, "link": link });
                await util.smsSender(dbData.mergedContact, otp);
                let link = config.NODE_SERVER_URL.url + ":" + config.NODE_SERVER_PORT.port + "/user/verify-email-link?email=" + data.email + "&otp=" + otp;
                util.sendEmailVerificationMail({ "email": data.email, "OTP": otp, "link": link });

                cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.OTP_VERIFY, "result": dbData._id });
            });
        }
        }]
    }, (err, response) => {
        callback(response.createUserinDB);
    });
}

let otpVerify = (data, callback) => {
    async.auto({
        getUserDataFromDB: (cb) => {
            if (!data.userId) {
                cb(null, { "statusCode": util.statusCode.ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }
            var criteria = {
                _id: data.userId,
                status: 'ACTIVE'
            }
            userDAO.getOneUser(criteria, (err, dbData) => {
                l(">>>>>>>>>>>>>>>>>>", err, dbData)
                if (err) {
                    l("ddddddddddddd")
                    cb(null, { "statusCode": util.statusCode.ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                    return;
                }
                let date = Date.now() + 300000
                if (dbData) {
                    if (data.otp != dbData.otp) {
                        return cb(null, { "statusCode": util.statusCode.ONE, "statusMessage": util.statusMessage.INVALID_OTP })
                    }
                    if (dbData.optExpireTime > date) {
                        return cb(null, { "statusCode": util.statusCode.ONE, "statusMessage": util.statusMessage.OTP_EXPIRED })
                    }
                    cb(null)



                } else {
                    return cb(null, { "statusCode": util.statusCode.NINE, "statusMessage": util.statusMessage.NO_DATA });
                }
            });
        },
        updateUserinDB: ['getUserDataFromDB', (functionData, cb) => {
            if (functionData && functionData.getUserDataFromDB && functionData.getUserDataFromDB.statusCode) {
                return cb(null, functionData.getUserDataFromDB);

            }

            var criteria = {
                _id: data.userId
            };
            var dataToSet = {
                $set: {
                    "otp": 0,
                    "verified": true
                }
            }
            //console.log(dataToSet,'data to set for otp request',criteria);

            userDAO.updateUser(criteria, dataToSet, {}, function (err, dbData) {
                if (err) {
                    return cb(null, { "statusCode": util.statusCode.ONE, "statusMessage": util.statusMessage.SERVER_BUSY });
                } else {
                    return cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.OTP_VERIFY_SUCCESS });
                }
            });

        }]
    }, (err, response) => {
        callback(response.updateUserinDB);
    })
}

let resendOtp = (data, callback) => {
    async.auto({
        getUserDataFromDB: (cb) => {
            if (!data.userId) {
                cb(null, { "statusCode": util.statusCode.ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }
            var criteria = {
                _id: data.userId,
                status: 'ACTIVE'
            }
            userDAO.getOneUser(criteria, (err, dbData) => {
                l(">>>>>>>>>>>>>>>>>>", err, dbData)
                if (err) {
                    l("ddddddddddddd")
                    cb(null, { "statusCode": util.statusCode.ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                    return;
                }
                let date = Date.now() + 300000
                if (dbData) {

                    cb(null, { mergedContact: dbData.mergedContact })



                } else {
                    return cb(null, { "statusCode": util.statusCode.NINE, "statusMessage": util.statusMessage.NO_DATA });
                }
            });
        },
        updateUserinDB: ['getUserDataFromDB', (functionData, cb) => {
            if (functionData && functionData.getUserDataFromDB && functionData.getUserDataFromDB.statusCode) {
                return cb(null, functionData.getUserDataFromDB);

            }
            let otp = Math.floor(100000 + Math.random() * 900000)
            otp = Math.abs(otp)
            var criteria = {
                _id: data.userId
            };
            var dataToSet = {
                $set: {
                    "otp": otp,
                    "otpExpireTime": Date.now()
                }
            }
            //console.log(dataToSet,'data to set for otp request',criteria);

            userDAO.updateUser(criteria, dataToSet, {}, async function (err, dbData) {
                if (err) {
                    return cb(null, { "statusCode": util.statusCode.ONE, "statusMessage": util.statusMessage.SERVER_BUSY });
                } else {
                    await util.smsSender(dbData.mergedContact, otp);
                    return cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.OTP_VERIFY });
                }
            });

        }]
    }, (err, response) => {
        callback(response.updateUserinDB);
    })
}

let completeProfile = (data, file, callback) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            if (!data.userId) {

                cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }
            var criteria = {
                _id: data.userId,
                status: "ACTIVE"
            }
            userDAO.getUser(criteria, {}, {}, (err, dbData) => {
                console.log(dbData, "post", err)

                if (err) {
                    return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                  }

                if (dbData && dbData.length) {
                    let criteria1 = {
                        instagramUser:data.instagramUser,
                        status:"ACTIVE"
                    }
                    userDAO.getOneUser(criteria1,(err1,result1)=>{
                        if(err1){
                            return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                        }
                        else if(!result1){
                            cb(null, { result: dbData[0] })
                        }
                        else{
                            return cb(null, { "statusCode": util.statusCode.TWO_KNOT_TWO, "statusMessage": util.statusMessage.INSTAUSEREXIST })
                        }
                    })
                }
                else {
                    cb(null, { "statusCode": util.statusCode.CREATED, "statusMessage": util.statusMessage.NO_DATA });
                    return;
                }

            });
        },
        completeProfile: ['checkUserExistsinDB', (functionData, cb) => {
            if (functionData.checkUserExistsinDB && functionData.checkUserExistsinDB.statusCode) {
                cb(null, functionData.checkUserExistsinDB)
            } else {
                if (data.facebookId || data.googleId) {
                    if (data.facebookId) {
                        [0].forEach(async x => {
                            let instaUser = await util.instaBasicProfile(data.instagramUser)
                            if (instaUser.details == false) {
                                return cb(null, { "statusCode": util.statusCode.CREATED, "statusMessage": 'Instagram username not found' })
                            }

                            let criteria = {
                                facebookId: data.facebookId
                            }

                            let dataToSet = {
                                fullName: data.fullName,
                                instagramUser: data.instagramUser,
                                completeProfile: true,

                            }
                            if (file) {
                                dataToSet.image = file.filename
                            }
                            if (instaUser.isVerified) {
                                dataToSet.isVerified = true
                            }

                            userDAO.updateUser(criteria, dataToSet, {}, (err2, updatedUser) => {
                                console.log("profile completed successfully ", updatedUser)
                                if (err2) {
                                    return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })

                                }


                                let objToCreate = {

                                    userId: updatedUser._id,
                                    profilePic: instaUser.profilePic ? instaUser.profilePic : '',
                                    username: instaUser.username ? instaUser.username : data.instagramUser,
                                    totalLikes: instaUser.totalLikes ? instaUser.totalLikes : 0,
                                    totalComments: instaUser.totalComments ? instaUser.totalComments : 0,
                                    totalFollowers: instaUser.followers ? instaUser.followers : 0,
                                    following: instaUser.following ? instaUser.following : 0,
                                    timeTaken: instaUser.timeTaken ? instaUser.timeTaken : 0,
                                    biography: instaUser.biography ? instaUser.biography : '',
                                    totalPost: instaUser.totalPost ? instaUser.totalPost : 0,
                                    engagements: instaUser.engagements ? instaUser.engagements : '',
                                    isVerified: instaUser.isVerified ? instaUser.isVerified : false,
                                    businessAccount: instaUser.businessAccount ? instaUser.businessAccount : false,
                                    topPost: instaUser.topPost ? instaUser.topPost : [],
                                    details: instaUser.details ? instaUser.details : false
                                }
                                instagramUserDao.createInstagram(objToCreate, (err, result) => {
                                    console.log(">>>>>>>>>>>>>>>>>>>>>>>", err, result)
                                })


                                cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.VERIFY_EMAIL, UpdatedUser: updatedUser })
                            })
                        })
                    }
                    if (data.googleId) {
                        [0].forEach(async x => {

                            let instaUser = await util.instaBasicProfile(data.instagramUser)
                            if (instaUser.details == false) {
                                return cb(null, { "statusCode": util.statusCode.CREATED, "statusMessage": 'Instagram username not found' })
                            }
                            let criteria = {
                                googleId: data.googleId
                            }
                            let dataToSet = {
                                fullName: data.fullName,
                                instagramUser: data.instagramUser,
                                completeProfile: true,

                            }
                            if (file) {
                                dataToSet.image = file.filename
                            }
                            if (instaUser.isVerified) {
                                dataToSet.isVerified = true
                            }
                            userDAO.updateUser(criteria, dataToSet, {}, (err2, updatedUser) => {
                                console.log("profile completed successfully ", updatedUser)
                                if (err2) {
                                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                                    return;
                                }


                                let objToCreate = {

                                    userId: updatedUser._id,
                                    profilePic: instaUser.profilePic ? instaUser.profilePic : '',
                                    username: instaUser.username ? instaUser.username : data.instagramUser,
                                    totalLikes: instaUser.totalLikes ? instaUser.totalLikes : 0,
                                    totalComments: instaUser.totalComments ? instaUser.totalComments : 0,
                                    totalFollowers: instaUser.followers ? instaUser.followers : 0,
                                    following: instaUser.following ? instaUser.following : 0,
                                    timeTaken: instaUser.timeTaken ? instaUser.timeTaken : 0,
                                    biography: instaUser.biography ? instaUser.biography : '',
                                    totalPost: instaUser.totalPost ? instaUser.totalPost : 0,
                                    engagements: instaUser.engagements ? instaUser.engagements : '',
                                    isVerified: instaUser.isVerified ? instaUser.isVerified : false,
                                    businessAccount: instaUser.businessAccount ? instaUser.businessAccount : false,
                                    topPost: instaUser.topPost ? instaUser.topPost : [],
                                    details: instaUser.details ? instaUser.details : false
                                }
                                instagramUserDao.createInstagram(objToCreate, (err, result) => {
                                    console.log(">>>>>>>>>>>>>>>>>>>>>>>", err, result)
                                })

                                // let link = config.NODE_SERVER_URL.url + ":" + config.NODE_SERVER_PORT.port + "/user/verify-email-link?email=" + data.email + "&otp=" + otp;
                                // util.sendEmailVerificationMail({ "email": data.email, "OTP": otp, "link": link });
                                cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.VERIFY_EMAIL, UpdatedUser: updatedUser })
                            })
                        })
                    }
                }
                [0].forEach(async x => {
                    let instaUser = await util.instaBasicProfile(data.instagramUser)
                    // if (instaUser.details == false) {
                    //     return cb(null, { "statusCode": util.statusCode.CREATED, "statusMessage": 'Instagram username not found' })
                    // }
                    let criteria = {
                        _id: data.userId
                    }
                    let dataToSet = {
                        fullName: data.fullName,
                        instagramUser: data.instagramUser,
                        completeProfile: true
                    }
                    if (instaUser.isVerified) {
                        dataToSet.isVerified = true
                    }
                    if (file) {
                        dataToSet.image = file.filename
                    }
                    userDAO.updateUser(criteria, dataToSet, {}, (err2, updatedUser) => {
                        console.log("profile completed successfully ", updatedUser)
                        if (err2) {
                            cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                            return;
                        }


                        let objToCreate = {

                            userId: updatedUser._id,
                            profilePic: instaUser.profilePic ? instaUser.profilePic : '',
                            username: instaUser.username ? instaUser.username : data.instagramUser,
                            totalLikes: instaUser.totalLikes ? instaUser.totalLikes : 0,
                            totalComments: instaUser.totalComments ? instaUser.totalComments : 0,
                            totalFollowers: instaUser.followers ? instaUser.followers : 0,
                            following: instaUser.following ? instaUser.following : 0,
                            timeTaken: instaUser.timeTaken ? instaUser.timeTaken : 0,
                            biography: instaUser.biography ? instaUser.biography : '',
                            totalPost: instaUser.totalPost ? instaUser.totalPost : 0,
                            engagements: instaUser.engagements ? instaUser.engagements : '',
                            isVerified: instaUser.isVerified ? instaUser.isVerified : false,
                            businessAccount: instaUser.businessAccount ? instaUser.businessAccount : false,
                            topPost: instaUser.topPost ? instaUser.topPost : [],
                            details: instaUser.details ? instaUser.details : false
                        }
                        instagramUserDao.createInstagram(objToCreate, (err, result) => {
                            console.log(">>>>>>>>>>>>>>>>>>>>>>>", err, result)
                        })

                        // let link = config.NODE_SERVER_URL.url + ":" + config.NODE_SERVER_PORT.port + "/user/verify-email-link?email=" + data.email + "&otp=" + otp;
                        // util.sendEmailVerificationMail({ "email": data.email, "OTP": otp, "link": link });
                        cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.VERIFY_EMAIL, UpdatedUser: updatedUser })
                    })
                })
            }
        }]
    }, (error, response) => {
        if (error) {
            l("Something went wrong", error)
            callback(error)
        }
        callback(response.completeProfile)
    })
}

let verifyEmailLink = (data, callback) => {
    async.auto({
        getUserDataFromDB: (cb) => {
            console.log("HHHHHHHHHHHHHHHHHHHHH", data)
            if (!data.email) {
                cb(null, { "statusCode": util.statusCode.ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }
            var criteria = {
                email: data.email,
                otp: data.otp,

            }
            // console.log(criteria,'criteria....');
            userDAO.getUser(criteria, {}, {}, (err, dbData) => {
                if (err) {
                    cb(null, { "statusCode": util.statusCode.ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                    return;
                }
                if (dbData && dbData.length) {
                    // console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>", Date.now(), dbData[0].emailExpireTime, dbData)
                    // if (parseInt(Date.now() - dbData[0]["emailExpireTime"]) < 600000) {

                    let dataToSet = {
                        $set: {
                            otp: 0,
                            emailVerified: true
                        }
                    }
                    let criteria = {
                        email: data.email
                    }
                    console.log(dataToSet, 'asdfasf', criteria);
                    userDAO.updateUser(criteria, dataToSet, {}, function (err, dbData) {
                        if (err) {
                            cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                            return;
                        }
                        cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.EMAIL_VERIFIED, })
                    });



                } else {
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.INVALID_LINK });
                }
            });
        }
    }, (err, response) => {
        callback(response.getUserDataFromDB);
    })
}

let login = (data, callback) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            if (!data.email) {
                cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }
            if (data.countryCode) {
                var criteria = {
                    $or: [
                        {
                            email: data.email,
                            status: "ACTIVE"
                        },
                        {
                            mergedContact: data.countryCode + data.email,
                            status: "ACTIVE"
                        }
                    ]

                }
            }
            else {
                var criteria = {
                    $or: [
                        {
                            email: data.email,
                            status: "ACTIVE"
                        },
                        {
                            mergedContact: data.email,
                            status: "ACTIVE"
                        }
                    ]

                }
            }
            // code to validate existance of customer id in middle ware server...
            userDAO.getUser(criteria, {}, {}, async (err, dbData) => {
                if (err) {
                    return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })

                }
                if (dbData && dbData.length > 0) {
                    if (dbData[0].verified == false) {
                        let otp = Math.floor(100000 + Math.random() * 900000)
                        otp = Math.abs(otp)
                        util.smsSender(dbData[0].mergedContact, otp);
                        let criteria = {
                            _id: dbData[0]._id
                        }
                        var dataToSet = {
                            $set: {
                                "otp": otp,
                                "otpExpireTime": Date.now()
                            }
                        }
                        //console.log(dataToSet,'data to set for otp request',criteria);

                        userDAO.updateUser(criteria, dataToSet, {}, async function (err, dbData) {
                            // if (err) {
                            //     return cb(null, { "statusCode": util.statusCode.ONE, "statusMessage": util.statusMessage.SERVER_BUSY });
                            // } else {
                            //     await util.smsSender(dbData.mergedContact, otp);
                            //     return cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.OTP_VERIFY });
                            // }
                        });
                        let user = {
                            userId: dbData[0]._id,
                            otpStatus: false,
                            phone:`${dbData[0].countryCode}-${dbData[0].phone}`
                        }
                        return cb(null, { "statusCode": util.statusCode.CREATED, "statusMessage": util.statusMessage.PHONE_NOT_VERIFIED, "result": user });
                    }
                    if (dbData[0].emailVerified == true) {
                        if (util.encryptData(data.password) == dbData[0].password) {
                            let token = jwt.sign({ _id: dbData[0]._id, time: Date.now }, config.SECURITY_KEY.KEY)
                            let data = {
                                userId: dbData[0]._id,
                                token: token
                            }
                            return cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.LOGGED_IN, "result": data });
                        } else {
                            return cb(null, { "statusCode": util.statusCode.NINE, "statusMessage": util.statusMessage.INCORRECT_PASSWORD });
                        }
                    }
                    if (dbData[0].verified == true && util.encryptData(data.password) == dbData[0].password) {
                        let token = jwt.sign({ _id: dbData[0]._id, time: Date.now() }, config.SECURITY_KEY.KEY)
                        let data = {
                            userId: dbData[0]._id,
                            token: token
                        }
                        if (dbData[0].completeProfile == false) {
                            data.completeProfile = false;
                            return cb(null, { "statusCode": util.statusCode.TWO_KNOT_THREE, "statusMessage": util.statusMessage.PROFILE_INCOMPLETE, "result": data });
                        }
                        // if (dbData[0].emailVerified == false) {
                        //     data.emailVerified = false;
                        //     return cb(null, { "statusCode": util.statusCode.TWO_KNOT_TWO, "statusMessage": util.statusMessage.EMAIL_NOT_VERIFIED, "result": data });
                        // }
                        return cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.LOGGED_IN, "result": data });
                    } else {
                        return cb(null, { "statusCode": util.statusCode.NINE, "statusMessage": util.statusMessage.INCORRECT_PASSWORD });
                    }


                } else {
                    return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.EMAIL_NOT_EXISTS });
                }
            });

        }
    }, (err, response) => {
        callback(response.checkUserExistsinDB);
    })
}

let loginWithFacebook = (data, callback) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            if (!data.facebookId || !data.loginType) {
                cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }
            if (data.loginType == 'facebook') {
                var criteria = {
                    facebookId: data.facebookId
                }
                // code to validate existance of customer id in middle ware server...
                userDAO.getUser(criteria, {}, {}, (err, dbData) => {
                    console.log(criteria, "log")
                    if (err) {
                        cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                        return;
                    }
                    if (dbData && dbData.length > 0) {
                        cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.LOGGED_IN, "result": dbData[0], "user_status": "old" });
                    }
                    else {

                        var userData = {
                            "facebookId": data.facebookId,
                            "facebookLoginStatus": 1,
                            "verified": true
                        }


                        userDAO.createUser(userData, (err, dbData) => {
                            console.log(err, "iiiiiii")
                            if (err) {
                                cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.EMAIL_ALREADY_REGISTERED });
                                return;
                            }
                            cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.REGISTRATION_DONE, "result": dbData, "user_status": "new" });
                            return;
                        });

                        //cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.EMAIL_NOT_EXIST });
                    }
                });

            }


        }
    }, (err, response) => {
        callback(response.checkUserExistsinDB);
    })
}

let loginWithGoogle = (data, callback) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            if (!data.googleId || !data.loginType) {
                cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }
            if (data.loginType == '')
                var criteria = {
                    googleId: data.googleId
                }
            // code to validate existance of customer id in middle ware server...
            userDAO.getUser(criteria, {}, {}, (err, dbData) => {
                if (err) {
                    console.log(err, 'error!!!');
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                    return;
                }
                if (dbData && dbData.length) {
                    cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.LOGGED_IN, "result": dbData[0], "user_status": "old" });
                } else {


                    var googleLoginData = {
                        "googleId": data.googleId,
                        "googleLoginStatus": 1,
                        "verified": true
                    }

                    userDAO.createUser(googleLoginData, (err, dbData) => {
                        if (err) {
                            console.log(err, 'error!!!');
                            cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.EMAIL_ALREADY_REGISTERED });
                            return;
                        }
                        cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.REGISTRATION_DONE, "result": dbData, "user_status": "new" });
                        return;
                    });
                }
            });


        }
    }, (err, response) => {
        callback(response.checkUserExistsinDB);
    })
}

let forgotPassword = (data, callback) => {
    // console.log(data,"dfkdfksd")
    async.auto({
        getUserDataFromDB: (cb) => {
            if (!data.email) {
                cb(null, { "statusCode": util.statusCode.ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }
            var criteria = {
                email: data.email,
                status: "ACTIVE"
            }
            userDAO.getUser(criteria, { phone: 1, email: 1, google_id: 1, facebook_id: 1, _id: 1 }, {}, (err, dbData) => {
                console.log(dbData, "kjsdkfhksd", err, dbData)
                if (err) {
                    cb(null, { "statusCode": util.statusCode.ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                    return;
                }

                if (dbData && dbData.length > 0) {

                    if (dbData[0].facebook_id = "") {
                        console.log(dbData[0].facebook_id != "")
                        cb(null, { "statusCode": util.statusCode.ONE, "statusMessage": util.statusMessage.SOCIAL_ACCOUNT });
                        return;
                    }
                    if (dbData[0].google_id = "") {
                        console.log(dbData[0].google_id != "")
                        cb(null, { "statusCode": util.statusCode.ONE, "statusMessage": util.statusMessage.SOCIAL_ACCOUNT });
                        return;
                    }
                    var OTP = Math.floor(100000 + Math.random() * 900000);
                    OTP = Math.abs(OTP)
                    cb(null, { "OTP": OTP });
                    util.sendForgotPasswordMail({ "email": dbData[0].email, "OTP": OTP });
                    // cb(null, { "statusCode": util.statusCode.NINE, "statusMessage": util.statusMessage.OTP_VERIFY_EMAIL });
                } else {
                    cb(null, { "statusCode": util.statusCode.NINE, "statusMessage": util.statusMessage.EMAIL_NOT_EXIST });
                }
            });
        },
        updateUserinDB: ['getUserDataFromDB', (functionData, cb) => {
            if (functionData && functionData.getUserDataFromDB && functionData.getUserDataFromDB.statusCode) {
                cb(null, functionData.getUserDataFromDB);
                return;
            }

            var criteria = {
                email: data.email
            };
            var dataToSet = {
                $set: {
                    "otp": functionData.getUserDataFromDB.OTP,
                    "otpExpireTime": Date.now()
                }
            }
            userDAO.updateUser(criteria, dataToSet, {}, function (err, dbData) {
                // l("tttttttttttttttt", err, dbData)
                if (err) {
                    cb(null, { "statusCode": util.statusCode.ONE, "statusMessage": util.statusMessage.SERVER_BUSY });
                } else {
                    let id = dbData._id;
                    cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.OTP_VERIFY_EMAIL, userId: id });
                }
            });

        }]
    }, (err, response) => {
        callback(response.updateUserinDB);
    })
}

let verifyForgotPasswordLink = (data, callback) => {
    async.auto({
        getUserDataFromDB: (cb) => {
            if (!data.email) {
                cb(null, { "statusCode": util.statusCode.ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }
            var criteria = {
                email: data.email,
                otp: data.otp,
            }
            userDAO.getUser(criteria, { email: 1, emailExpireTime: 1 }, {}, (err, dbData) => {
                if (err) {
                    cb(null, { "statusCode": util.statusCode.ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                    return;
                }
                if (dbData && dbData.length > 0) {
                    if (parseInt(Date.now() - dbData[0].otpExpireTime) < 600000) {
                        cb(null, { result: dbData[0].email });
                    } else {
                        cb(null, { "statusCode": util.statusCode.ONE, "statusMessage": util.statusMessage.LINK_EXPIRED });
                        return;
                    }
                } else {
                    cb(null, { "statusCode": util.statusCode.FOUR, "statusMessage": util.statusMessage.NO_DATA });
                }
            });
        },
        verifiedLink: ['getUserDataFromDB', (functionData, cb) => {
            if (functionData.getUserDataFromDB && functionData.getUserDataFromDB.statusCode) {
                cb(functionData.getUserDataFromDB)
            }
            let criteria = {
                email: functionData.getUserDataFromDB.result
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
                }
                cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.DOC_UPDATED })

            })
        }]
    }, (err, response) => {
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
                verified: true
                // isverified: true
            }
            userDAO.getUser(criteria, {}, {}, (err, dbData) => {
                if (err) {
                    cb(null, { "statusCode": util.statusCode.ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                    return;
                }

                if (dbData && dbData.length > 0) {
                    // if (dbData[0].emailVerified == true) {
                    cb(null);
                    // } else {
                    //     cb(null, { "statusCode": util.statusCode.ONE, "statusMessage": util.statusMessage.EMAIL_NOT_VERIFIED })
                    // }
                } else {
                    cb(null, { "statusCode": util.statusCode.NINE, "statusMessage": util.statusMessage.CUSTOMERID_NOT_REGISTERED });
                }
            });
        },
        updatePasswordInDB: ['checkUserExistsinDB', (functionData, cb) => {
            if (functionData && functionData.checkUserExistsinDB && functionData.checkUserExistsinDB.statusCode) {
                cb(null, functionData.checkUserExistsinDB);
                return;
            }
            if (data.password != data.confirmPassword) {
                cb(null, { "statusCode": util.statusCode.NINE, "statusMessage": "Password and confirm password not matched" });
            }
            var criteria = {
                _id: data.userId,
                status: "ACTIVE"
                // isverified: true
            }
            var dataToSet = {
                $set: {
                    "password": util.encryptData(data.password),
                    "otp": 0,
                    "otpExpireTime": 0
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
            if (!data.userId || !data.password || !data.confirmPassword || !data.oldPassword) {
                return cb(null, { "statusCode": util.statusCode.ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })
            }
            var criteria = {
                _id: data.userId,
                status: "ACTIVE",
                verified: true
            }
            userDAO.getUser(criteria, {}, {}, (err, dbData) => {
                if (err) {
                    return cb(null, { "statusCode": util.statusCode.ONE, "statusMessage": util.statusMessage.SERVER_BUSY })

                }

                if (dbData && dbData.length > 0) {
                    // if (dbData[0].emailVerified == true) {
                    cb(null, { result: dbData[0] });
                    // } else {
                    //     cb(null, { "statusCode": util.statusCode.ONE, "statusMessage": util.statusMessage.EMAIL_NOT_VERIFIED })
                    // }
                } else {
                    return cb(null, { "statusCode": util.statusCode.NINE, "statusMessage": util.statusMessage.CUSTOMERID_NOT_REGISTERED });
                }
            });
        },
        changePasswordInDB: ['checkUserExistsinDB', (functionData, cb) => {
            if (functionData && functionData.checkUserExistsinDB && functionData.checkUserExistsinDB.statusCode) {
                return cb(null, functionData.checkUserExistsinDB);

            }
            console.log("EFDLGSFGSJDTTKFJ", functionData)
            let userData = functionData.checkUserExistsinDB.result
            if (util.encryptData(data.oldPassword) != userData.password) {
                return cb(null, { "statusCode": util.statusCode.NINE, "statusMessage": "Invalid old password" });
            }
            if (data.password != data.confirmPassword) {
                return cb(null, { "statusCode": util.statusCode.NINE, "statusMessage": "Password and confirm password not matched" });
            }
            var criteria = {
                _id: data.userId,
                status: "ACTIVE"
                // isverified: true
            }
            var dataToSet = {
                $set: {
                    "password": util.encryptData(data.password)
                }
            }
            userDAO.updateUser(criteria, dataToSet, {}, function (err, dbData) {
                if (err) {
                    return cb(null, { "statusCode": util.statusCode.ONE, "statusMessage": util.statusMessage.SERVER_BUSY })

                }

                cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.PASSWORD_CHANGED })
            });
        }]
    }, (err, response) => {
        callback(response.changePasswordInDB);
    });
}

let getProfile = (data, callback) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            if (!data.userId) {

                cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }
            var criteria = {
                _id: data.userId,
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
            [0].forEach(async x => {
                // let instaUser = await util.instaBasicProfile(functionData.checkUserExistsinDB.result.instagramUser)
                let result = {
                    dbData: functionData.checkUserExistsinDB.result
                }

                cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.DATA_FETCHED, result: result })
            })

        }]

    }, (err, response) => {
        callback(response.getUserDataFromDB)
    })
}

let joinGroup = (data, callback) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            if (!data.userId) {

                cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }
            var criteria = {
                _id: data.userId,
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
                    cb(null, { result: dbData[0] });
                }
                else {
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.NO_DATA });
                    return;
                }

            });
        },
        checkGroupExistsinDB: (cb) => {
            if (!data.groupId) {

                cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }
            var criteria = {
                _id: data.groupId,
                groupStatus: "ACTIVE"
            }

            groupDAO.getGroup(criteria, {}, {}, (err, groupData) => {
                console.log(groupData, "post", err)

                if (err) {
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                    return;
                }

                if (groupData && groupData.length) {
                    cb(null, { result: groupData[0] });
                }
                else {
                    l("in here in706 ")
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.NO_DATA });
                    return;
                }

            });
        },
        checkUserExistsInGroup: (cb) => {
            if (!data.userId || !data.groupId) {

                cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }
            var criteria = {
                _id: data.groupId,
                groupStatus: "ACTIVE",
                groupMembers: {
                    $elemMatch: {
                        groupMember: data.userId
                    }
                }
            }

            groupDAO.getOneGroup(criteria, (err, groupData) => {
                console.log(groupData, "post", err)

                if (err) {
                    cb(null, { "statusCode": util.statusCode.NINE, "statusMessage": util.statusMessage.SERVER_BUSY })
                    return;
                }

                if (groupData) {
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.USER_EXIST });
                    return;
                }
                else {
                    cb(null);
                }

            });
        },
        joinGroups: ['checkUserExistsinDB', 'checkGroupExistsinDB', "checkUserExistsInGroup", (functionData, cb) => {
            console.log("just in users detail...", functionData.checkUserExistsinDB, ">>>>>>>>>>>>>", functionData.checkGroupExistsinDB, functionData.checkUserExistsInGroup)
            if (functionData.checkUserExistsinDB && functionData.checkUserExistsinDB.statusCode) {
                cb(null, functionData.checkUserExistsinDB);
                return;
            }
            if (functionData.checkGroupExistsinDB && functionData.checkGroupExistsinDB.statusCode) {
                cb(null, functionData.checkGroupExistsinDB);
                return;
            }
            if (functionData.checkUserExistsInGroup && functionData.checkUserExistsInGroup.statusCode) {
                cb(null, functionData.checkUserExistsInGroup);
                return;
            }
            let groupCheck = functionData.checkGroupExistsinDB.result
            if (groupCheck.groupType == 'VERIFIEDUSERS') {
                if (functionData.checkUserExistsinDB.result.isVerified == true) {
                    let criteria = {
                        _id: functionData.checkGroupExistsinDB.result._id
                    }
                    let newMember = {
                        groupMember: functionData.checkUserExistsinDB.result._id
                    }
                    let memberCount = functionData.checkGroupExistsinDB.result.memberCount;
                    memberCount = memberCount + 1;
                    let dataToSet = {
                        $push: { groupMembers: newMember },
                        $set: { memberCount: memberCount }
                    }
                    let username = functionData.checkUserExistsinDB.result.fullName;
                    let groupName = functionData.checkGroupExistsinDB.result.groupName;
                    groupDAO.updateGroup(criteria, dataToSet, {}, (err, groupUpdated) => {
                        if (err) {
                            return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })

                        } else {
                            let criteria = {
                                userType: "ADMIN",
                                status: "ACTIVE"
                            }
                            userDAO.getOneUser(criteria, async (err1, adminInfo) => {
                                if (err) {
                                    return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                                } else if (!adminInfo) {
                                    return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.NO_DATA });
                                } else {
                                    let subject = `Group joining notification`
                                    let html = `${username} just joined the ${groupName} group.
                                               Just check his details and Welcome him to the group`
                                    await util.sendNormalMail(adminInfo.email, subject, html)
                                    let criteria = {
                                        userId: data.userId,
                                        groupId: data.groupId
                                    }
                                    warningDAO.createwarning(criteria, (err, createdWarn) => {
                                        console.log("warnings" + createdWarn, "errrroooooooor" + err)
                                    })
                                    cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.GROUP_UPDATED, result: groupUpdated })
                                }
                            })
                        }
                    })
                } else {
                    return cb(null, { "statusCode": util.statusCode.TWO_KNOT_TWO, "statusMessage": util.statusMessage.NOT_VERIFIED_INSTA });
                }
            }

            let criteria = {
                _id: functionData.checkGroupExistsinDB.result._id
            }
            let newMember = {
                groupMember: functionData.checkUserExistsinDB.result._id
            }
            let memberCount = functionData.checkGroupExistsinDB.result.memberCount;
            memberCount = memberCount + 1;
            let dataToSet = {
                $push: { groupMembers: newMember },
                $set: { memberCount: memberCount }
            }
            let username = functionData.checkUserExistsinDB.result.fullName;
            let groupName = functionData.checkGroupExistsinDB.result.groupName;
            groupDAO.updateGroup(criteria, dataToSet, {}, (err, groupUpdated) => {
                if (err) {
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                    return;
                } else {
                    let criteria = {
                        userType: "ADMIN",
                        status: "ACTIVE"
                    }
                    userDAO.getOneUser(criteria, async (err1, adminInfo) => {
                        if (err1) {
                            cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                            return;
                        } else if (!adminInfo) {
                            cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.NO_DATA });
                            return;
                        } else {
                            let subject = `Group joining notification`
                            let html = `${username} just joined the ${groupName} group.
                                       Just check his details and Welcome him to the group`
                            await util.sendNormalMail(adminInfo.email, subject, html)
                            let criteria = {
                                userId: data.userId,
                                groupId: data.groupId
                            }
                            warningDAO.createwarning(criteria, (err, createdWarn) => {
                                console.log("warnings" + createdWarn, "errrroooooooor" + err)
                            })

                            rewardsDAO.getRewards({rewardType:"JOINING"},{},{},(err1,result1)=>{
                                if(err1){
                                    console.log("somehing went wrong")
                                }
                                userDAO.getOneUser({_id:data.userId},(err3,result3)=>{
                                    if(err){
                                        console.log("wrong in getting detail")
                                    }
                                    let bonus = result3.rewardPoint;
                                    bonus = bonus+result1.rewardPoint;
                                    userDAO.updateUser({_id:data.userId},{$set:{rewardPoint:bonus}},{},(err4,result4)=>{
                                        if(err4){
                                            console.log("got wrong in 134")
                                        }
                                        console.log("successfully>>>>>>>>>>>>>>>>>>>",result4)
                                    })
                                })
                            })
                            cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.GROUP_UPDATED, result: groupUpdated })
                        }
                    })
                }
            })

        }]

    }, (error, response) => {
        callback(response.joinGroups)
    })
}

let updateUser = (data, file, callback) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            if (!data.userId) {

                return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })

            }
            var criteria = {
                _id: data.userId,
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
                    return cb(null);
                }
                else {
                    return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.NO_DATA });
                }

            });
        },
        updateUser: ['checkUserExistsinDB', (functionData, cb) => {
            if (functionData.checkUserExistsinDB && functionData.checkUserExistsinDB.statusCode) {
                cb(null, functionData.checkUserAndGroupExistsinDB)
            } else {
                let criteria = {
                    _id: data.userId
                }

                let dataToSet = data
                if (file) {
                    dataToSet.image = file.filename
                }
                if (data.phone) {
                    dataToSet.mergedContact = data.countryCode + data.phone
                }
                userDAO.updateUser(criteria, dataToSet, {}, (err2, updatedUser) => {
                    if (err2) {
                        cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                        return;
                    }
                    cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.DATA_UPDATED, UpdatedUser: updatedUser })
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

let searchGroup = (data, callback) => {
    async.auto({
        checkUserExistsInDB: (cb) => {
            if (!data.userId) {
                cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }
            var criteria = {
                _id: data.userId,
                status: "ACTIVE",
                verified: true
            }

            userDAO.getUser(criteria, {}, {}, (err, dbData) => {
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
        searchGroupInDB: ['checkUserExistsInDB', (functionData, cb) => {
            if (functionData.checkUserExistsinDB && functionData.checkUserExistsinDB.statusCode) {
                cb(functionData.checkUserExistsinDB)
            }
            if (data.search) {
                let criteria = {
                    groupName: { $regex: '^' + data.search, $options: 'i' },
                    groupStatus: "ACTIVE",
                    groupType:{$nin:["VERIFIEDUSERS","CHAT"]}
                }
                

                groupDAO.getGroup(criteria, {}, {}, (error, groups) => {
                    if (error) {
                        l("LLLLLLLLLLL", error)
                        cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                        return;
                    }
                    else if (groups.length == 0) {
                        cb(null, { "statusCode": util.statusCode.CREATED, "statusMessage": util.statusMessage.NO_DATA });
                        return;
                    } else {
                        cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.GROUP_FOUND, groups: groups })
                    }
                })
            } else {
                let criteria = {
                    groupStatus: "ACTIVE",
                    groupType:{$nin:["VERIFIEDUSERS","CHAT"]}
                }
                let option = {
                    // page: data.page ? data.page : 1,
                    // limit: data.limit ? data.limit : 10,
                    sort : {memberCount:-1}
                }
                groupDAO.getGroup(criteria,{} ,option, (error, groups) => {
                    if (error) {
                        l("LLLLLLLLLLL", error)
                        cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                        return;
                    }
                    else if (groups.length == 0) {
                        cb(null, { "statusCode": util.statusCode.CREATED, "statusMessage": util.statusMessage.NO_DATA });
                        return;
                    } else {
                        cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.GROUP_FOUND, groups: groups })
                    }
                })
            }
        }]
    },
        (error, response) => {
            callback(response.searchGroupInDB)
        })
}

let onlyVerifiedGroups = (data,callback)=>{
    async.auto({
        checkUserExistsInDB: (cb) => {
            if (!data.userId) {
                cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }
            var criteria = {
                _id: data.userId,
                status: "ACTIVE",
                verified: true
            }

            userDAO.getUser(criteria, {}, {}, (err, dbData) => {
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
        searchGroupInDB: ['checkUserExistsInDB', (functionData, cb) => {
            if (functionData.checkUserExistsinDB && functionData.checkUserExistsinDB.statusCode) {
                cb(functionData.checkUserExistsinDB)
            }
            if (data.search) {
                let criteria = {
                    groupName: { $regex: '^' + data.search, $options: 'i' },
                    groupStatus: "ACTIVE",
                    groupType:"VERIFIEDUSERS"
                }
                

                groupDAO.getGroup(criteria, {}, {}, (error, groups) => {
                    if (error) {
                        l("LLLLLLLLLLL", error)
                        cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                        return;
                    }
                    else if (groups.length == 0) {
                        cb(null, { "statusCode": util.statusCode.CREATED, "statusMessage": util.statusMessage.NO_DATA });
                        return;
                    } else {
                        cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.GROUP_FOUND, groups: groups })
                    }
                })
            } else {
                let criteria = {
                    groupStatus: "ACTIVE",
                    groupType:"VERIFIEDUSERS"
                }
                let option = {
                    // page: data.page ? data.page : 1,
                    // limit: data.limit ? data.limit : 10,
                    sort : {memberCount:-1}
                }
                groupDAO.getGroup(criteria,{} ,option, (error, groups) => {
                    if (error) {
                        l("LLLLLLLLLLL", error)
                        cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                        return;
                    }
                    else if (groups.length == 0) {
                        cb(null, { "statusCode": util.statusCode.CREATED, "statusMessage": util.statusMessage.NO_DATA });
                        return;
                    } else {
                        cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.GROUP_FOUND, groups: groups })
                    }
                })
            }
        }]
    },
        (error, response) => {
            callback(response.searchGroupInDB)
        })
}

let groupDetail = (data, callback) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            if (!data.userId || !data.groupId) {

                return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })

            }
            var criteria = {
                _id: data.userId,
                status: "ACTIVE",
                verified: true
            }

            userDAO.getUser(criteria, {}, {}, (err, dbData) => {

                if (err) {
                    return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })

                }

                if (dbData && dbData.length) {
                    cb(null, { result: dbData[0] });
                }
                else {
                    return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.NO_DATA });

                }

            });

        },
        checkGroupExistsinDB: (cb) => {
            if (!data.groupId) {

                return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })

            }
            var criteria = {
                _id: data.groupId,
                groupStatus: "ACTIVE"
            }
            let option = {
                populate: {
                    path: 'groupMembers.groupMember', select: 'image fullName _id'
                }
            }
            groupDAO.getGroup(criteria, {}, option, (err, groupData) => {
                if (err) {
                    return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                }

                if (groupData && groupData.length) {
                    cb(null, { result: groupData[0] });
                }
                else {
                    l("in here in706 ")
                    return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.NO_DATA });
                }

            });
        },
        checkUserExistsInGroup: (cb) => {
            if (!data.userId || !data.groupId) {

                return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })

            }
            var criteria = {
                _id: data.groupId,
                groupStatus: "ACTIVE",
                groupMembers: {
                    $elemMatch: {
                        groupMember: data.userId
                    }
                }
            }

            groupDAO.getOneGroup(criteria, (err, groupData) => {
                console.log(groupData, "post", err)

                if (err) {
                    return cb(null, { "statusCode": util.statusCode.NINE, "statusMessage": util.statusMessage.SERVER_BUSY })
                }

                if (!groupData) {
                    cb(null, { exists: false });
                }
                else {
                    cb(null, { exists: true });
                }

            })
        },
        groupDetail: ["checkUserExistsinDB", "checkGroupExistsinDB", "checkUserExistsInGroup", (functionData, cb) => {
            if (functionData.checkUserExistsinDB && functionData.checkUserExistsinDB.statusCode) {
                return cb(null, functionData.checkUserExistsinDB);

            }
            if (functionData.checkGroupExistsinDB && functionData.checkGroupExistsinDB.statusCode) {
                return cb(null, functionData.checkGroupExistsinDB);

            }
            if (functionData.checkUserExistsInGroup && functionData.checkUserExistsInGroup.statusCode) {
                return cb(null, functionData.checkUserExistsInGroup);

            }
            if (functionData.checkUserExistsInGroup.exists == false) {
                [0].forEach(async x => {
                    let obj = {};
                    // let obj1=Object.assign({},functionData.checkGroupExistsinDB.result);
                    let newMemberArr=[];
                    let members = functionData.checkGroupExistsinDB.result.groupMembers;
                    members.forEach(x=>{
                       if(x.groupMember){
                          newMemberArr.push(x);
                       }
                    })
                    let rules = await getRules()
                    obj.groupName = functionData.checkGroupExistsinDB.result.groupName;
                    obj.groupPic = functionData.checkGroupExistsinDB.result.groupPic;
                    obj.coverPic = functionData.checkGroupExistsinDB.result.coverPic;
                    obj.groupMembers = newMemberArr;
                    obj.rules = rules
                    obj.warnings = {
                        "totalLinksProvided": 0,
                        "pendingAction": 0,
                        "remainingWarnings": 0,
                        "showPendingAction": []
                    }
                    obj.isMember = false;
                    let criteria1 = {
                        groupId: functionData.checkGroupExistsinDB.result._id
                    }
                    instaLinksDAO.getInstaLinks(criteria1, {}, { sort: { createdAt: -1 }, populate: { path: 'userId', select: 'fullName image' } }, (err, instaLinks) => {
                        if (err) {
                            return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                        }
                        if (instaLinks.length == 0) {
                            obj.URLS = [];
                            return cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.DATA_FETCHED, groupDetail: obj })
                        }
                        obj.URLS = instaLinks;
                        return cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.DATA_FETCHED, groupDetail: obj })
                    })
                })
            }
            else {
                [0].forEach(async x => {
                    let warning = await checkWarnings(data.userId, data.groupId)
                    let rules = await getRules()
                    let obj = {};
                    // let obj1=Object.assign({},functionData.checkGroupExistsinDB.result);
                    let newMemberArr=[];
                    let members = functionData.checkGroupExistsinDB.result.groupMembers;
                    members.forEach(x=>{
                       if(x.groupMember){
                          newMemberArr.push(x);
                       }
                    })
                    obj.groupName = functionData.checkGroupExistsinDB.result.groupName;
                    obj.groupPic = functionData.checkGroupExistsinDB.result.groupPic;
                    obj.coverPic = functionData.checkGroupExistsinDB.result.coverPic;
                    obj.groupMembers = newMemberArr;
                    obj.warnings = warning;
                    obj.rules = rules;
                    obj.isMember = true;
                    let criteria1 = {
                        groupId: functionData.checkGroupExistsinDB.result._id
                    }
                    instaLinksDAO.getInstaLinks(criteria1, {}, { sort: { createdAt: -1 }, populate: { path: 'userId', select: 'fullName image' } }, (err, instaLinks) => {
                        if (err) {
                            return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                        }
                        if (instaLinks.length == 0) {
                            obj.URLS = [];
                            return cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.DATA_FETCHED, groupDetail: obj })
                        }
                        let newInstaLinks = [];
                        instaLinks.forEach(x=>{
                            if(x.userId){
                                newInstaLinks.push(x);
                            }
                        })
                        obj.URLS = newInstaLinks;
                        return cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.DATA_FETCHED, groupDetail: obj })
                    })
                })
            }

        }]
    },
        (error, response) => {
            callback(response.groupDetail)
        })
}

let joinEvent = (data, callback) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            if (!data.userId) {

                cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }
            var criteria = {
                _id: data.userId,
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
                    cb(null, { result: dbData[0] });
                }
                else {
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.NO_DATA });
                    return;
                }

            });
        },
        checkEventExistsinDB: (cb) => {
            if (!data.eventId) {

                cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }
            var criteria = {
                _id: data.eventId,
                eventStatus: "ACTIVE"
            }

            eventDAO.getEvent(criteria, {}, {}, (err, EventData) => {
                console.log(EventData, "post", err)

                if (err) {
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                    return;
                }

                if (EventData && EventData.length) {
                    // let currentTime = Date.now();
                    // let eventStartTime = new Date(EventData[0].startDate)
                    // let eventEndTime = new Date(EventData[0].endDate)
                    // if (currentTime < eventStartTime) {
                    //     return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.EVENT_NOT_START })
                    // }
                    // if (currentTime > eventEndTime) {
                    //     return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.EVENT_EXPIRE })
                    // }
                    cb(null, { result: EventData[0] });
                }
                else {
                    l("in here in706 ")
                    return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.NO_DATA });

                }

            });
        },
        checkUserExistsInEvent: (cb) => {
            if (!data.userId || !data.eventId) {

                cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }
            var criteria = {
                _id: data.eventId,
                eventStatus: "ACTIVE",
                eventMembers: {
                    $elemMatch: {
                        eventMember: data.userId
                    }
                }
            }

            eventDAO.getOneEvent(criteria, (err, EventData) => {
                if (err) {
                    cb(null, { "statusCode": util.statusCode.NINE, "statusMessage": util.statusMessage.SERVER_BUSY })
                    return;
                }

                if (EventData) {
                    cb(null,{exist:true})
                }
                else {
                    cb(null,{exist:false});
                }

            });
        },
        joinEvents: ['checkUserExistsinDB', 'checkEventExistsinDB', "checkUserExistsInEvent", (functionData, cb) => {
            console.log("just in users detail...", functionData.checkUserExistsinDB, ">>>>>>>>>>>>>", functionData.checkEventExistsinDB, functionData.checkUserExistsInEvent)
            if (functionData.checkUserExistsinDB && functionData.checkUserExistsinDB.statusCode) {
                cb(null, functionData.checkUserExistsinDB);
                return;
            }
            if (functionData.checkEventExistsinDB && functionData.checkEventExistsinDB.statusCode) {
                cb(null, functionData.checkEventExistsinDB);
                return;
            }
            if (functionData.checkUserExistsInEvent && functionData.checkUserExistsInEvent.statusCode) {
                cb(null, functionData.checkUserExistsInEvent);
                return;
            }
            let existence = functionData.checkUserExistsInEvent.exist;
            let criteria = {
                _id: functionData.checkEventExistsinDB.result._id
            }
            let newMember = {
                eventMember: functionData.checkUserExistsinDB.result._id
            }
            let memberCount = functionData.checkEventExistsinDB.result.memberCount;
            memberCount = memberCount + 1;
            let dataToSet = {
                $push: { eventMembers: newMember },
                $set: { memberCount: memberCount }
            }
            eventDAO.updateEvent(criteria, dataToSet, {}, (err, EventUpdated) => {
                if (err) {
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                    return;
                } else {
                    let criteria = {
                        userType: "ADMIN",
                        status: "ACTIVE"
                    }
                    let userName = functionData.checkUserExistsinDB.result.fullName;
                    let eventName = functionData.checkEventExistsinDB.result.eventName;
                    userDAO.getOneUser(criteria, async (err1, adminInfo) => {
                        if (err1) {
                            cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                            return;
                        } else if (!adminInfo) {
                            cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.NO_DATA });
                            return;
                        } else {
                            let subject = `Event joining notification`
                            let html = `${userName} just joined the 
                                        ${eventName}.
                                            Just check his details and Welcome him to the Event.`
                            await util.sendNormalMail(adminInfo.email, subject, html)
                            let eventUpdated = Object.assign({},EventUpdated)
                             if(existence == true){
                                 eventUpdated.exist = true
                             }
                             if(existence == false){
                                eventUpdated.exist = false
                            }
                            cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.EVENT_UPDATED, result: eventUpdated })
                        }
                    })
                }
            })

        }]

    }, (error, response) => {
        callback(response.joinEvents)
    })
}

let searchEvent = (data, callback) => {
    async.auto({
        checkUserExistsInDB: (cb) => {
            if (!data.userId || !data.search) {
                cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }
            var criteria = {
                _id: data.userId,
                status: "ACTIVE",
                verified: true
            }

            userDAO.getUser(criteria, {}, {}, (err, dbData) => {
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
        searchEventInDB: ['checkUserExistsInDB', (functionData, cb) => {
            if (functionData.checkUserExistsinDB && functionData.checkUserExistsinDB.statusCode) {
                cb(functionData.checkUserExistsinDB)
            }
            let criteria = {
                eventName: { $regex: '^' + data.search, $options: 'i' },
                eventStatus: "ACTIVE"
            }
            let option = {
                page: data.page ? data.page : 1,
                limit: data.limit ? data.limit : 5
            }
            eventDAO.paginateData(criteria, option, (error, events) => {
                if (error) {
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                    return;
                }
                else if (events.docs.length == 0) {
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.NO_DATA });
                    return;
                } else {
                    cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.EVENT_FOUND, events: events })
                }
            })
        }]
    },
        (error, response) => {
            callback(response.searchEventInDB)
        })
}

let allHashTag = (data, callback) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            if (!data.userId) {

                cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }
            var criteria = {
                _id: data.userId,
                status: "ACTIVE",
                verified: true
            }

            userDAO.getUser(criteria, {}, {}, (err, dbData) => {
                if (err) {
                    return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })

                }

                if (dbData && dbData.length) {
                    cb(null, { result: dbData[0] });
                }
                else {
                    return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.NO_DATA });

                }

            });
        },
        allHashTag: ['checkUserExistsinDB', (functionData, cb) => {
            if (functionData.checkUserExistsinDB && functionData.checkUserExistsinDB.statusCode) {
                return cb(null, functionData.checkUserExistsinDB)

            }
            let criteria = {
                userId: data.userId
            }
            hashTagDAO.getHashTag(criteria, {}, {}, (err, hashTags1) => {
                if (err) {
                    return cb(null, { "statusCode": util.statusCode.FIVE_ZERO_ZERO, "statusMessage": util.statusMessage.SOMETHING_WENT_WRONG })

                }
                let allTags =
                {
                    "name": "#summer",
                    "popularity": 444706375,
                    "hashtagSuggestion": [
                        "#flowers",
                        "#uttarakhand",
                        "#beauty",
                        "#uttrakhand",
                        "#beautiful",
                        "#light",
                        "#uttrakhand",
                        "#blue",
                        "#blue",
                        "#uttarakhandtourism",
                        "#oldtown",
                        "#sydneyfood",
                        "#dinner",
                        "#foodie",
                        "#likeforlikeback",
                        "#alldaydining",
                        "#foodie",
                        "#likeit",
                        "#likeit",
                        "#greekfood",
                        "#be",
                        "#brazil",
                        "#oregonexplored",
                        "#pnw",
                        "#fortaleza",
                        "#pnwdiscovered",
                        "#pnw",
                        "#queseja",
                        "#queseja",
                        "#northwest"
                    ]
                }
                let allTag1 = {
                    "name": "#art",
                    "popularity": 570452338,
                    "hashtagSuggestion": [
                        "#draw",
                        "#drawings",
                        "#digitaldrawing",
                        "#artist",
                        "#nailgomel",
                        "#digital",
                        "#pictures",
                        "#nail",
                        "#pictures",
                        "#hisophiescribble",
                        "#challenge",
                        "#talented",
                        "#melanin",
                        "#rock",
                        "#picture",
                        "#LA",
                        "#different",
                        "#musicproducer",
                        "#different",
                        "#freddiemercury",
                        "#hdr",
                        "#moment",
                        "#vaporwaves",
                        "#galaxy",
                        "#exposure",
                        "#awesome",
                        "#capture",
                        "#instapic",
                        "#capture",
                        "#vaporwaveart"
                    ]
                }
                let allTag2 = {
                    "name": "#travel",
                    "popularity": 455956005,
                    "hashtagSuggestion": [
                        "#travel",
                        "#instagood",
                        "#nature",
                        "#peoplewhohike",
                        "#travel",
                        "#welivetoexplore",
                        "#beach",
                        "#hikingadventures",
                        "#travelbug",
                        "#explore",
                        "#folk",
                        "#travellife",
                        "#goodmorning",
                        "#happydays",
                        "#folk",
                        "#instapassport",
                        "#rain",
                        "#blogger",
                        "#yollarda",
                        "#backpacking",
                        "#psychedelic",
                        "#acidtrip",
                        "#fluorescent",
                        "#fall",
                        "#psychedelic",
                        "#amazingday",
                        "#illustration",
                        "#visual",
                        "#photographyislife",
                        "#open"
                    ]
                }
                let allTag3 = {
                    "name": "#photography",
                    "popularity": 496864961,
                    "hashtagSuggestion": [
                        "#elegant",
                        "#perfect",
                        "#woman",
                        "#lovely",
                        "#glow",
                        "#makeup",
                        "#classy",
                        "#radiant",
                        "#makeup",
                        "#lovely",
                        "#colors",
                        "#sun",
                        "#instatravel",
                        "#illustration",
                        "#artwork",
                        "#painting",
                        "#drawing",
                        "#artgallery",
                        "#painting",
                        "#illustration",
                        "#bayareamoms",
                        "#amaneceres",
                        "#fotografos",
                        "#joyasfotograficas",
                        "#bayareanewborn",
                        "#newbornposing",
                        "#bayareanewbornphotography",
                        "#cdmxparatodos",
                        "#newbornposing",
                        "#joyasfotograficas"
                    ]
                }
                let allTag4 = {
                    "name": "#food",
                    "popularity": 363831743,
                    "hashtagSuggestion": [
                        "#follow4follow",
                        "#look",
                        "#look",
                        "#sky",
                        "#foodporn",
                        "#marisqueria",
                        "#sky",
                        "#likes4likes",
                        "#cocteleria",
                        "#look",
                        "#alasfotomedan",
                        "#photography",
                        "#photography",
                        "#beautiful",
                        "#pizza",
                        "#faze",
                        "#beautiful",
                        "#cake",
                        "#lobster",
                        "#photography",
                        "#foodbloggers",
                        "#yumm",
                        "#yumm",
                        "#Pueblo",
                        "#ItalianFood",
                        "#Receta",
                        "#Pueblo",
                        "#eatfamous",
                        "#Gastronomia",
                        "#yumm"
                    ]
                }
                let allTag5 = {
                    "name": "#lifestyle",
                    "popularity": 199414906,
                    "hashtagSuggestion": [
                        "#balmain",
                        "#shh",
                        "#change",
                        "#thursday",
                        "#itsasecret",
                        "#fornow",
                        "#completecare",
                        "#transformation",
                        "#beauty",
                        "#itsasecret",
                        "#shoppingonline",
                        "#kyoto",
                        "#doyoutravel",
                        "#foodie",
                        "#song",
                        "#bamboo",
                        "#traveltoeat",
                        "#japan",
                        "#highaf",
                        "#song",
                        "#Mente",
                        "#baby",
                        "#jeans",
                        "#sorrisonorosto",
                        "#mama",
                        "#firsttimemom",
                        "#sorrisonovo",
                        "#babytime",
                        "#dentista",
                        "#mama"
                    ]
                }
                let allTag6 = {
                    "name": "#fitness",
                    "popularity": 367886326,
                    "hashtagSuggestion": [
                        "#delicious",
                        "#foodlover",
                        "#vegano",
                        "#organic",
                        "#vegano",
                        "#vegan",
                        "#foodie",
                        "#vegano",
                        "#eatclean",
                        "#healthy",
                        "#samuraifc",
                        "#alexa",
                        "#AlexaGrasso",
                        "#irenealdana",
                        "#AlexaGrasso",
                        "#ufcfighting",
                        "#bilhar",
                        "#AlexaGrasso",
                        "#ufc",
                        "#boliche",
                        "#cherrycreeknorth",
                        "#entrepreneurlife",
                        "#work",
                        "#meditar",
                        "#work",
                        "#indoorcycling",
                        "#igfitness",
                        "#work",
                        "#business",
                        "#struggle"
                    ]
                }

                let mapped = {
                    identity: 'summer',
                    hashTagName: '#summer',
                    title: '#summer',
                    hashSuggestion: ['#iphonesia',
                        '#photography',
                        '#instamood',
                        '#jj',
                        '#instamood',
                        '#webstagram',
                        '#instagood',
                        '#cute',
                        '#iphoneonly',
                        '#instagood',
                        '#everland',
                        '#travelgram',
                        '#scrambler',
                        '#volgotoscana',
                        '#scrambler',
                        '#sum',
                        '#internationalcouple',
                        '#lotteworld',
                        '#quarterhorse',
                        '#internationalcouple',
                        '#laugh',
                        '#mountain',
                        '#traveller',
                        '#landscapephotography',
                        '#traveller',
                        '#positivity',
                        '#ootd',
                        '#goodlife',
                        '#amsterdamworld',
                        '#ootd']
                }
                let mapped2 = {
                    identity: 'summer',
                    hashTagName: '#photooftheday',
                    title: '#photooftheday',
                    hashSuggestion: ['#outfit',
                        '#outfit',
                        '#model',
                        '#cinematography',
                        '#smile',
                        '#smiles',
                        '#cinematography',
                        '#beardeddragon',
                        '#looks',
                        '#outfit',
                        '#polette',
                        '#polette',
                        '#witch',
                        '#pictureoftheday',
                        '#research',
                        '#princecharming',
                        '#pictureoftheday',
                        '#happygirl',
                        '#music',
                        '#polette',
                        '#polishgirl',
                        '#polishgirl',
                        '#outdoors',
                        '#americanstyle',
                        '#vscocam',
                        '#worldshotz',
                        '#americanstyle',
                        '#kampadanes',
                        '#gremovhribe',
                        '#polishgirl']
                }

                let mapped3 = {
                    identity: 'summer',
                    hashTagName: '#light',
                    title: '#light',
                    hashSuggestion: ['#likeforlikes',
                        '#arunachal',
                        '#hue',
                        '#instagood',
                        '#shape',
                        '#shade',
                        '#hue',
                        '#shape',
                        '#shade',
                        '#cute',
                        '#silhouettephotography',
                        '#travelindia',
                        '#soulfultraveller',
                        '#holychants',
                        '#womenwhotravel',
                        '#womenwhowrite',
                        '#soulfultraveller',
                        '#womenwhotravel',
                        '#womenwhowrite',
                        '#travelgram',
                        '#positivevibes',
                        '#throattattoo',
                        '#tattoolife',
                        '#ink',
                        '#apparel',
                        '#tattoolifestyle',
                        '#tattoolife',
                        '#apparel',
                        '#tattoolifestyle',
                        '#inkedgirl']
                }
                let mapped4 = {
                    identity: 'art',
                    hashTagName: '#art',
                    title: '#art',
                    hashSuggestion: ['#seaturtleart',
                        '#creative',
                        '#artwork',
                        '#yogaart',
                        '#wushu',
                        '#ocean',
                        '#beautiful',
                        '#artsy',
                        '#sea',
                        '#artistsoninstagram',
                        '#joglosemar',
                        '#passion',
                        '#solo',
                        '#finance',
                        '#graphicdesign',
                        '#glamour',
                        '#cards',
                        '#diamond',
                        '#compoundinterest',
                        '#semarnusantara',
                        '#minimal',
                        '#girls',
                        '#monotone',
                        '#indian',
                        '#galar',
                        '#bollywood',
                        '#bathroom',
                        '#blackwhite',
                        '#entertainment',
                        '#monochrome']
                }
                let mapped5 = {
                    identity: 'art',
                    hashTagName: '#seaturtleart',
                    title: '#seaturtleart',
                    hashSuggestion: ['#fluidart',
                        '#seaturtleartwork',
                        '#floridaartist',
                        '#ocean',
                        '#aum',
                        '#seaturtles',
                        '#turtle',
                        '#seaturtles',
                        '#artist',
                        '#abstractart',
                        '#surrealpainting',
                        '#surrealart',
                        '#seaturtlesofinstagram',
                        '#pennypaintings',
                        '#coincollecting',
                        '#succulentpainting',
                        '#seaturtlelover',
                        '#succulentpainting',
                        '#wildlifepainting',
                        '#surrealwatercolor',
                        '#scrollsawart',
                        '#stonepaintingartist',
                        '#stoneart',
                        '#vvanimals',
                        '#paintedrocks',
                        '#refrigeratormagnets',
                        '#rockpaintingisfun',
                        '#refrigeratormagnets',
                        '#blackworknow',
                        '#intarsia']
                }
                let mapped6 = {
                    identity: 'art',
                    hashTagName: '#pennypaintings',
                    title: '#pennypaintings',
                    hashSuggestion: ['#westernpainting',
                        '#miniaturerealism',
                        '#coincollecting',
                        '#artcollecting',
                        '#lincolnart',
                        '#pennyartist',
                        '#coincollecting',
                        '#lambart',
                        '#paintingoncopper',
                        '#originalpaintingsforsale',
                        '#petpainting',
                        '#catlover',
                        '#animalartists',
                        '#animalartistry',
                        '#pupper',
                        '#instaartist',
                        '#animalartists',
                        '#petportraitartist',
                        '#miniaturepainting',
                        '#petportraitpennies',
                        '#littleshopofhorrors',
                        '#disneyworld',
                        '#mickeymouse',
                        '#waltdisneyworld',
                        '#ocean',
                        '#ludington',
                        '#mickeymouse',
                        '#paintedonapenny',
                        '#80smovies',
                        '#disneyland']
                }
                let mapped7 = {
                    identity: 'travel',
                    hashTagName: '#travel',
                    title: '#travel',
                    hashSuggestion: ['#cruise',
                        '#topalgeriaphoto',
                        '#algiers',
                        '#alger',
                        '#saona',
                        '#aroundtheworld',
                        '#topalgeriaphoto',
                        '#topalgeriaphoto',
                        '#travelspain',
                        '#follow4followback',
                        '#vacaciones',
                        '#portrait',
                        '#warnerbrothersstudiotour',
                        '#model',
                        '#espa',
                        '#style',
                        '#portrait',
                        '#portrait',
                        '#Mayan',
                        '#redhair',
                        '#bayern',
                        '#sheisnotlost',
                        '#castle',
                        '#visualoflife',
                        '#duomomilano',
                        '#wildernessculture',
                        '#sheisnotlost',
                        '#sheisnotlost',
                        '#adventurethatislife',
                        '#exploretocreate']
                }
                let mapped8 = {
                    identity: 'travel',
                    hashTagName: '#cruise',
                    title: '#cruise',
                    hashSuggestion: ['#maldives',
                        '#COSTACRUISES',
                        '#COSTACRUISES',
                        '#algerianstyle',
                        '#alger',
                        '#lifeonboard',
                        '#cruiselife',
                        '#bonaireartsandcraftscruisemarket',
                        '#cruiselife',
                        '#srilanka',
                        '#customized',
                        '#bag',
                        '#bag',
                        '#designer',
                        '#waterbottles',
                        '#igersjp',
                        '#ladies',
                        '#magnifica',
                        '#ladies',
                        '#personalizedgifts',
                        '#crewlife',
                        '#viagemdecruzeiro',
                        '#viagemdecruzeiro',
                        '#shipping',
                        '#park',
                        '#instapic',
                        '#instagram',
                        '#latina',
                        '#instagram',
                        '#harmonyoftheseas']
                }
                let mapped9 = {
                    identity: 'travel',
                    hashTagName: '#maldives',
                    title: '#maldives',
                    hashSuggestion: ['#beautiful',
                        '#gaytravel',
                        '#bar',
                        '#dhigurah',
                        '#mylove',
                        '#gaytravel',
                        '#cloudy',
                        '#portraitphotography',
                        '#COSTACRUISES',
                        '#swing',
                        '#travellingthroughtheworld',
                        '#landscapephotography',
                        '#bluesea',
                        '#travelstory',
                        '#wanderlust',
                        '#landscapephotography',
                        '#life',
                        '#jewelrydesigner',
                        '#urlopik',
                        '#memories',
                        '#borabora',
                        '#bestdiscovery',
                        '#honeymooners',
                        '#smile',
                        '#vacationmode',
                        '#bestdiscovery',
                        '#traveladdict',
                        '#eurotrip',
                        '#happy',
                        '#summervacation']
                }
                let mapped10 = {
                    identity: 'photography',
                    hashTagName: '#Photography',
                    title: '#Photography',
                    hashSuggestion: ['#pictures',
                        '#beautiful',
                        '#art',
                        '#pics',
                        '#instagood',
                        '#ootd',
                        '#photos',
                        '#fashion',
                        '#pic',
                        '#sports',
                        '#chill',
                        '#postapocalyptic',
                        '#scifi',
                        '#entity',
                        '#futuristic',
                        '#classicalmusic',
                        '#woman',
                        '#blackandwhitephotography',
                        '#portrait',
                        '#graffiti',
                        '#inked',
                        '#likeislike',
                        '#instagoods',
                        '#bikersofinstagram',
                        '#examenoinsta',
                        '#brazil',
                        '#bikelifestyle',
                        '#achadosdasemana',
                        '#ride',
                        '#ridersofinstagram']
                }
                let mapped11 = {
                    identity: 'photography',
                    hashTagName: '#pictures',
                    title: '#pictures',
                    hashSuggestion: ['#poupee',
                        '#baby',
                        '#bucket',
                        '#jetrouvejejette',
                        '#vocation',
                        '#photographer',
                        '#lifestyle',
                        '#head',
                        '#head',
                        '#poupee',
                        '#shots',
                        '#urbanphotography',
                        '#kids',
                        '#street',
                        '#ktmduke390',
                        '#klaroline',
                        '#urban',
                        '#TagsForLikes',
                        '#TagsForLikes',
                        '#shots',
                        '#herbstbilder',
                        '#hashtag',
                        '#redheads',
                        '#redheadsdoitbetter',
                        '#picturesoil',
                        '#oilpainting',
                        '#baldistwochenende',
                        '#herbstfarben',
                        '#herbstfarben',
                        '#herbstbilder']
                }
                let mapped12 = {
                    identity: 'photography',
                    hashTagName: '#ridersofinstagram',
                    title: '#ridersofinstagram',
                    hashSuggestion: ['#ridersofinstagram',
                        '#ktmfactoryracing',
                        '#instadaily',
                        '#wearthespeed',
                        '#superbikes',
                        '#ridersofkerala',
                        '#100kmphofficial',
                        '#wearthespeed',
                        '#ridersofindia',
                        '#modified',
                        '#squadronblue',
                        '#royalenfieldriders',
                        '#road',
                        '#chongqing',
                        '#travelchina',
                        '#naturelovers',
                        '#motorradfahren',
                        '#chongqing',
                        '#classic500',
                        '#china',
                        '#ducatimonster796',
                        '#instapic',
                        '#monster796',
                        '#clubdavina',
                        '#chestnut',
                        '#travelingram',
                        '#cbr600r',
                        '#clubdavina',
                        '#soulhorse',
                        '#fuchsstute']
                }
                let mapped13 = {
                    identity: 'food',
                    hashTagName: '#food',
                    title: '#food',
                    hashSuggestion: ['#freefrom',
                        '#foodlovers',
                        '#foodie',
                        '#freefrom',
                        '#foodie',
                        '#lowfat',
                        '#delicious',
                        '#slimmingworlduk',
                        '#syns',
                        '#glutenfreeslimmingworld',
                        '#vegetarianfood',
                        '#vegetarian',
                        '#comidadeverdade',
                        '#vegetarianfood',
                        '#comidadeverdade',
                        '#ratemyplate',
                        '#brazil',
                        '#bomdia',
                        '#californiabear',
                        '#cafeteria',
                        '#foodyhcm',
                        '#nefisgram',
                        '#kochen',
                        '#foodyhcm',
                        '#kochen',
                        '#banhbeochen',
                        '#foody',
                        '#bratkartoffeln',
                        '#pratikyemekler',
                        '#yummymummies']
                }
                let mapped14 = {
                    identity: 'food',
                    hashTagName: '#delicious',
                    title: '#delicious',
                    hashSuggestion: ['#chocolate',
                        '#Ecuador',
                        '#Piedelimon',
                        '#Piedelimon',
                        '#Heladeria',
                        '#PornFood',
                        '#Pasteleria',
                        '#cream',
                        '#Tortadevainilla',
                        '#cream',
                        '#italiano',
                        '#cakeinspiration',
                        '#cakestragram',
                        '#cakestragram',
                        '#yolo',
                        '#restaurantdesign',
                        '#carpediem',
                        '#gastro',
                        '#BolosPersonalizados',
                        '#gastro',
                        '#appetite',
                        '#fishcurry',
                        '#pistacchio',
                        '#pistacchio',
                        '#chennaifoodie',
                        '#kolkata',
                        '#bangalorefoodies',
                        '#bengalifoods',
                        '#biscotti',
                        '#bengalifoods']
                }
                let mapped15 = {
                    identity: 'food',
                    hashTagName: '#foodlovers',
                    title: '#foodlovers',
                    hashSuggestion: ['#darjeeling',
                        '#indiancuisine',
                        '#vegetarian',
                        '#officesnacks',
                        '#desifood',
                        '#tasty',
                        '#foodies',
                        '#healthy',
                        '#noidafoodie',
                        '#foodtalkindia',
                        '#cocktails',
                        '#restaurantdesign',
                        '#luxurylifestyle',
                        '#pasticceriaitaliana',
                        '#FoodLasPalmas',
                        '#18anni',
                        '#instaparty',
                        '#dripcake',
                        '#pasticceria',
                        '#cafe',
                        '#SahabatPerjalananmu',
                        '#punefoodlove',
                        '#instagrammer',
                        '#ootd',
                        '#blogging',
                        '#foodislove',
                        '#kalyaninagar',
                        '#hopinpune',
                        '#homecooking',
                        '#sopune']
                }
                if (hashTags1.length == 0) {
                    let objToSave = {
                        userId: data.userId,
                        hashTag: ["Summer", "Art", "Travel", "Photography", "Food", "lifestyle", "fitness"],
                        all: [allTags, allTag1, allTag2, allTag3, allTag4, allTag5, allTag6],
                        mappedHashTag: [mapped, mapped2, mapped3, mapped4, mapped5, mapped6, mapped7, mapped8, mapped9, mapped10, mapped11, mapped12, mapped13, mapped14, mapped15]
                    }
                    hashTagDAO.createHashTag(objToSave, (err2, created) => {
                        if (err2) {
                            return cb(null, { "statusCode": util.statusCode.FIVE_ZERO_ZERO, "statusMessage": util.statusMessage.SOMETHING_WENT_WRONG })
                        }
                        console.log("KKKKKKKKKKKKKKKKKKKK", created)
                        return cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.DATA_FETCHED, result: [created] });
                    })
                } else
                    cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.DATA_FETCHED, result: hashTags1 });
            })

        }]
    },
        (error, response) => {
            callback(response.allHashTag)
        })
}

let hashTagCategory = (data, callback) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            if (!data.userId || !data.key) {
                cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }
            var criteria = {
                _id: data.userId,
                status: "ACTIVE",
                verified: true
            }

            userDAO.getUser(criteria, {}, {}, (err, dbData) => {
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
        searchhash: ['checkUserExistsinDB', (functionData, cb) => {
            if (functionData.checkUserExistsinDB && functionData.checkUserExistsinDB.statusCode) {
                cb(null, functionData.checkUserExistsinDB)
                return;
            }
            let criteria1 = {
                'userId': data.userId,
                // 'mappedHashTag.identity':{ $regex: '^' + data.search, $options: 'i' }
            }
            hashTagDAO.getHashTag(criteria1, {}, {}, (err, result) => {
                if (err) {
                    return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                }
                else if (result.length == 0) {
                    return cb(null, { "statusCode": util.statusCode.NINE, "statusMessage": util.statusMessage.NO_DATA })
                }
                else {
                    let searchData = result[0].mappedHashTag;
                    var filteredArray = searchData.filter(function (obj) {
                        return obj.identity === data.key.toLowerCase();
                    });
                    if (filteredArray.length == 0) {
                        return cb(null, { "statusCode": util.statusCode.CREATED, "statusMessage": util.statusMessage.DATA_LOADING })
                    }
                    return cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.DATA_FETCHED, Tags: filteredArray })
                }
            })

        }]
    },
        (error, response) => {
            callback(response.searchhash)
        })
}

let dataaa = {}
let hashTagSearch = (data, callback) => {
    if (!data) {
        return
    }
    dataaa = Object.assign({}, data)
    async.auto({
        checkUserExistsinDB: (cb) => {
            if (!data.userId && !data.search) {
                cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }
            var criteria = {
                _id: data.userId,
                status: "ACTIVE",
                verified: true
            }

            userDAO.getUser(criteria, {}, {}, (err, dbData) => {
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
        hashTag: ['checkUserExistsinDB', (functionData, cb) => {
            if (functionData.checkUserExistsinDB && functionData.checkUserExistsinDB.statusCode) {
                cb(null, functionData.checkUserExistsinDB)
                return;
            }
            [0].forEach(async x => {
                let hashtag = await util.hashTagSearch(data.search)
                hashtag.userId = data.userId
                if (!hashtag) {
                    cb(null, { "statusCode": util.statusCode.FIVE_ZERO_ZERO, "statusMessage": util.statusMessage.SOMETHING_WENT_WRONG })
                    return;
                }


                cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.DATA_FETCHED, result: hashtag });

            })

        }]
    },
        (error, response) => {
            console.log("response>>>>>>>>>", response)
            dataaa['hashtag'] = Object.assign({}, response.hashTag.result)
            processInBg(dataaa.userId, dataaa.hashtag)

            callback(response.hashTag)
        })
}

let processInBg = (userId, hashtag) => {
    let criteria = { userId: userId }

    let updatehash = hashtag.hashtagSuggestion.slice(0, 10)
    let newArr = []
    for (let i = 0; i < updatehash.length; i++) {
        let a = updatehash[i];
        a = a.split('#');
        a = a[1];
        newArr.push(a);
    }
    let dataToSet = {
        $set: { 'hashTag': newArr, mappedHashTag: [], all: [] }
    }
    hashTagDAO.updateHashTag(criteria, dataToSet, {}, async (err, result) => {
        if (err) {
            return;
        }
        //   let newArray = [];

        for (let i = 0; i < newArr.length; i++) {
            let key = newArr[i];
            let tagsArray = await util.hashTagSearch(key);
            if (tagsArray.length == 0) {
                return;
            }
            let tagsArray1 = tagsArray.hashtagSuggestion.slice(0, 5);
            await sleep(2000);
            for (let j = 0; j < tagsArray1.length; j++) {
                let obj = {}
                let allObj = {}
                let key1 = tagsArray1[j];
                key1 = key1.split('#');
                key1 = key1[1];
                let tagsArray2 = await util.hashTagSearch(key1);
                if (tagsArray2.length == 0) {
                    return;
                }
                obj.identity = key;
                obj.hashTagName = key1
                obj.title = '#' + key1;
                obj.hashSuggestion = tagsArray2.hashtagSuggestion;
                allObj.name = key1
                allObj.popularity = tagsArray2.popularity
                allObj.hashtagSuggestion = tagsArray2.hashtagSuggestion
                //   newArray.push(obj);
                let dataToSet = {
                    $push: {
                        mappedHashTag: obj,
                        all: allObj
                    }
                }
                await hashTagDAO.updateHashTag(criteria, dataToSet, {},
                    async (err1, result1) => { console.log("KKKKKKKKKK", err1, "LLLLLLLLL", result1) })
                await sleep(2000);
            }
        }
        // dataaa = {};
        return;
    })

}

let instaUserAnalytics = (data, callback) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            if (!data.userId) {

                return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })
            }
            var criteria = {
                _id: data.userId,
                status: "ACTIVE",
                verified: true
            }

            userDAO.getUser(criteria, {}, {}, (err, dbData) => {
                if (err) {
                    return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })

                }

                if (dbData && dbData.length) {
                    cb(null, { result: dbData[0] });
                }
                else {
                    return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.NO_DATA });

                }

            });
        },
        getInstagramDetails: ['checkUserExistsinDB', (functionData, cb) => {
            if (functionData.checkUserExistsinDB && functionData.checkUserExistsinDB.statusCode) {
                return cb(null, functionData.checkUserExistsinDB)

            }
            let userInsta = util.instaBasicProfile(functionData.checkUserExistsinDB.result.instagramUser)
            if (!userInsta) {
                return cb(null, { "statusCode": util.statusCode.FIVE_ZERO_ZERO, "statusMessage": util.statusMessage.SOMETHING_WENT_WRONG })

            }
            // let userInsta 
            cb(null, { "statusCode": util.statusCode.OK, "statusMessage": "Instagram details of a user", "result": userInsta });

        }]
    },
        (error, response) => {
            callback(response.getInstagramDetails)
        })
}

// let showCards = (data, callback) => {
//     // checksDetail = Object.assign({}, data)
//     async.auto({
//         checkUserExistsinDB: (cb) => {
//             if (!data.userId) {

//                 return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })
//             }
//             var criteria = {
//                 _id: data.userId,
//                 status: "ACTIVE",
//                 verified: true
//             }

//             userDAO.getUser(criteria, {}, {}, (err, dbData) => {
//                 if (err) {
//                     return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
//                 }

//                 if (dbData && dbData.length) {
//                     cb(null, { result: dbData[0] });
//                 }
//                 else {
//                     return cb(null, { "statusCode": util.statusCode.CREATED, "statusMessage": util.statusMessage.NO_DATA });

//                 }

//             });
//         },
//         checkGroupExistsinDB: (cb) => {
//             if (!data.groupId) {

//                 return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })

//             }
//             var criteria = {
//                 _id: data.groupId,
//                 groupStatus: "ACTIVE"
//             }
//             let option = {
//                 populate: {
//                     path: 'groupMembers.groupMember', select: 'image fullName _id'
//                 }
//             }
//             groupDAO.getGroup(criteria, {}, option, (err, groupData) => {
//                 if (err) {
//                     return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
//                 }

//                 if (groupData && groupData.length) {
//                     cb(null, { result: groupData[0] });
//                 }
//                 else {
//                     return cb(null, { "statusCode": util.statusCode.CREATED, "statusMessage": util.statusMessage.NO_DATA });
//                 }

//             });
//         },
//         checkUserExistsInGroup: (cb) => {
//             if (!data.userId || !data.groupId) {

//                 return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })

//             }
//             var criteria = {
//                 _id: data.groupId,
//                 groupStatus: "ACTIVE",
//                 groupMembers: {
//                     $elemMatch: {
//                         groupMember: data.userId
//                     }
//                 }
//             }

//             groupDAO.getOneGroup(criteria, (err, groupData) => {
//                 if (err) {
//                     return cb(null, { "statusCode": util.statusCode.NINE, "statusMessage": util.statusMessage.SERVER_BUSY })
//                 }

//                 if (!groupData) {
//                     return cb(null, { "statusCode": util.statusCode.CREATED, "statusMessage": util.statusMessage.USER_NOTINGROUP })
//                 }
//                 else {
//                     cb(null, { groupData: groupData });
//                 }

//             })
//         },
//         getCards: ["checkUserExistsinDB", "checkGroupExistsinDB", "checkUserExistsInGroup", (functionData, cb) => {
//             if (functionData.checkUserExistsinDB && functionData.checkUserExistsinDB.statusCode) {
//                 return cb(null, functionData.checkUserExistsinDB);

//             }
//             if (functionData.checkGroupExistsinDB && functionData.checkGroupExistsinDB.statusCode) {
//                 return cb(null, functionData.checkGroupExistsinDB);

//             }
//             if (functionData.checkUserExistsInGroup && functionData.checkUserExistsInGroup.statusCode) {
//                 return cb(null, functionData.checkUserExistsInGroup);

//             }

//             let criteria = [
//                 {
//                     $match: {
//                         groupId: mongoose.Types.ObjectId(data.groupId),
//                         // _id: { $nin: array }
//                     }
//                 },
//                 { $sample: { 'size': 5 } },
//                 {
//                     "$lookup":
//                     {
//                         "from": "users",
//                         "localField": "userId",
//                         "foreignField": "_id",
//                         "as": "data"
//                     }
//                 }
//             ]
//             instaLinksDAO.randomCards(criteria, (err, gotCards) => {
//                 if (err) {
//                     return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
//                 } else if (gotCards.length == 0) {
//                     return cb(null, { "statusCode": util.statusCode.CREATED, "statusMessage": util.statusMessage.NO_DATA })
//                 } else {
//                     cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.DATA_FETCHED, cards: gotCards })
//                 }
//             })
//                 }]
//     },
//         (error, response) => {
//             callback(response.getCards)
//         })
// }

let showCards = (data, callback) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            if (!data.userId) {

                return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })
            }
            var criteria = {
                _id: data.userId,
                status: "ACTIVE",
                verified: true
            }

            userDAO.getUser(criteria, {}, {}, (err, dbData) => {
                if (err) {
                    return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                }

                if (dbData && dbData.length) {
                    cb(null, { result: dbData[0] });
                }
                else {
                    return cb(null, { "statusCode": util.statusCode.CREATED, "statusMessage": util.statusMessage.NO_DATA });

                }

            });
        },
        checkGroupExistsinDB: (cb) => {
            if (!data.groupId) {

                return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })

            }
            var criteria = {
                _id: data.groupId,
                groupStatus: "ACTIVE"
            }
            let option = {
                populate: {
                    path: 'groupMembers.groupMember', select: 'image fullName _id'
                }
            }
            groupDAO.getGroup(criteria, {}, option, (err, groupData) => {
                if (err) {
                    return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                }

                if (groupData && groupData.length) {
                    cb(null, { result: groupData[0] });
                }
                else {
                    return cb(null, { "statusCode": util.statusCode.CREATED, "statusMessage": util.statusMessage.NO_DATA });
                }

            });
        },
        checkUserExistsInGroup: (cb) => {
            if (!data.userId || !data.groupId) {

                return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })

            }
            var criteria = {
                _id: data.groupId,
                groupStatus: "ACTIVE",
                groupMembers: {
                    $elemMatch: {
                        groupMember: data.userId
                    }
                }
            }

            groupDAO.getOneGroup(criteria, (err, groupData) => {
                if (err) {
                    return cb(null, { "statusCode": util.statusCode.NINE, "statusMessage": util.statusMessage.SERVER_BUSY })
                }

                if (!groupData) {
                    return cb(null, { "statusCode": util.statusCode.CREATED, "statusMessage": util.statusMessage.USER_NOTINGROUP })
                }
                else {
                    cb(null, { groupData: groupData });
                }

            })
        },
        checkURLExistenceInGroups:(cb)=>{
            console.log("rweuiqtruwqfdhasf",data.groupId)
            if (!data.groupId) {

                return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })

            }
            var criteria2 = {
                groupId: data.groupId
            }

            instaLinksDAO.getInstaLinks(criteria2,{},{}, (err, instaLinks) => {
                console.log("KKKKKKKKKKKKKKKKKKKKKKKKKK",instaLinks)
                if (err) {
                    return cb(null, { "statusCode": util.statusCode.NINE, "statusMessage": util.statusMessage.SERVER_BUSY })
                }

                else if (instaLinks.length==0) {
                    return cb(null, { "statusCode": util.statusCode.TWO_KNOT_THREE, "statusMessage": util.statusMessage.NO_URLS })
                }
                else {
                    if(instaLinks.length<=5){
                        cb(null,{instaLinks:instaLinks})
                    }
                    else{
                        cb(null , {instaLinks:null});
                    }
                }

            }) 
        },
        checkExistingWarnings: (cb) => {
            var criteria = {
                userId: data.userId,
                groupId: data.groupId
            }

            warningDAO.getwarning(criteria, {}, {}, (err, links) => {
                console.log("hhhhhhhhhhhhhhhhhh", err, links)
                if (err) {
                    return cb(null, { "statusCode": util.statusCode.NINE, "statusMessage": util.statusMessage.SERVER_BUSY })
                }

                if (links.length == 0) {
                    warningDAO.createwarning(criteria, (err, createdWarn) => {
                        console.log("warnings" + createdWarn, "errrroooooooor" + err)
                        cb(null, { links: createdWarn })
                    })
                }
                else {
                    let urlIds = [];
                    let urlNotToIncludeInRandom = [];
                    if (links[0].pendingAction.length) {
                        for (let i = 0; i < links[0].totalLinksProvided.length; i++) {
                            urlNotToIncludeInRandom.push(links[0].totalLinksProvided[i].urlId)
                        }
                    }
                    if (links[0].totalLinksProvided.length) {
                        for (let i = 0; i < links[0].pendingAction.length; i++) {
                            urlIds.push(links[0].pendingAction[i].urlId)
                        }
                    }
                    console.log("SADFSDSGTJFJFGHJFGHaaaaaaaaaa", urlNotToIncludeInRandom)
                    instaLinksDAO.getInstaLinks({ userId: data.userId, groupId: data.groupId, _id: { $in: urlIds } }, {}, {}, (err, result) => {
                        console.log("KKKKKKKKKKKKKKKKKKKKK", result)
                        cb(null, {
                            links: links[0],
                            existingLinks: result ? result : [],
                            urlNotToIncludeInRandom: urlNotToIncludeInRandom ? urlNotToIncludeInRandom : []
                        });
                    })
                    //    }
                    //    else {
                    //        cb(null)
                    //    }
                }

            })
        },
        
        getCards: ["checkUserExistsinDB", "checkGroupExistsinDB", "checkUserExistsInGroup", "checkExistingWarnings","checkURLExistenceInGroups", (functionData, cb) => {
            if (functionData.checkUserExistsinDB && functionData.checkUserExistsinDB.statusCode) {
                return cb(null, functionData.checkUserExistsinDB);

            }
            if (functionData.checkGroupExistsinDB && functionData.checkGroupExistsinDB.statusCode) {
                return cb(null, functionData.checkGroupExistsinDB);

            }
            if (functionData.checkUserExistsInGroup && functionData.checkUserExistsInGroup.statusCode) {
                return cb(null, functionData.checkUserExistsInGroup);

            }
            if(functionData.checkURLExistenceInGroups && functionData.checkURLExistenceInGroups.statusCode) {
                return cb (null,functionData.checkURLExistenceInGroups);
            }
            if (functionData.checkExistingWarnings && functionData.checkExistingWarnings.statusCode) {
                return cb(null, functionData.checkExistingWarnings);

            }
            if(functionData.checkURLExistenceInGroups.instaLinks){
                let ab=functionData.checkURLExistenceInGroups.instaLinks
                let criteria = {
                    userId: data.userId,
                    groupId: data.groupId
                }
                let bufferList = []
                ab.forEach(x => {
                    let obj = {}
                    obj.urlId = x._id;
                    bufferList.push(obj);
                    console.log("Dsfsdagadfgdsfgsdcvxcbb cxfdsvdfc", x)
                    let dataToSet = {
                        $addToSet: {
                            totalLinksProvided: { urlId: x._id }
                        },
                        $set: {
                            pendingAction: bufferList,
                            linksBuffer: bufferList
                        }
                    }
                    warningDAO.updatewarning(criteria, dataToSet, { multi: true }, (err, result) => {
                        console.log("updated warnings>>>>>>>>>>>>>>>>>", result, "Errrooooooooooooor", err)
                    })
                })
                let newArray=[];
                    ab.forEach(x=>{
                        if(x.data){
                            newArray.push(x);
                        }
                    })
                return cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.DATA_FETCHED, cards: newArray })
            }
            console.log("SAFDSFGDFHGJHKJGDJFHGSAFD", functionData)
            // if (functionData.checkExistingWarnings.links.pendingAction.length == 0) {
            let array = []
            if (functionData.checkExistingWarnings.links.totalLinksProvided.length > 0) {
                let urlNotToInclude = functionData.checkExistingWarnings.urlNotToIncludeInRandom
                for (let i = 0; i < urlNotToInclude.length; i++) {
                    let objectId = mongoose.Types.ObjectId(urlNotToInclude[i]);
                    array.push(objectId);
                }
            }
            let criteria = [
                {
                    $match: {
                        groupId: mongoose.Types.ObjectId(data.groupId),
                        _id: { $nin: array }
                    }
                },
                { $sort: { createdAt: -1 } },
                { $limit: 5 },
                {
                    "$lookup":
                    {
                        "from": "users",
                        "localField": "userId",
                        "foreignField": "_id",
                        "as": "data"
                    }
                }
            ]
            instaLinksDAO.randomCards(criteria, (err, gotCards) => {
                if (err) {
                    return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                } else if (gotCards.length == 0) {
                    return cb(null, { "statusCode": util.statusCode.CREATED, "statusMessage": util.statusMessage.WAIT })
                } else {
                    console.log("DDDDDD>>>>>>>>>>>>>>>>>>>", gotCards)
                    let newArray=[];
                    gotCards.forEach(x=>{
                        if(x.data){
                            newArray.push(x);
                        }
                    })
                    cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.DATA_FETCHED, cards: newArray})
                    let criteria = {
                        userId: data.userId,
                        groupId: data.groupId
                    }
                    let bufferList = []
                    gotCards.forEach(x => {
                        let obj = {}
                        obj.urlId = x._id;
                        bufferList.push(obj);
                        console.log("Dsfsdagadfgdsfgsdcvxcbb cxfdsvdfc", x)
                        let dataToSet = {
                            $addToSet: {
                                totalLinksProvided: { urlId: x._id }
                            },
                            $set: {
                                pendingAction: bufferList,
                                linksBuffer: bufferList
                            }
                        }
                        warningDAO.updatewarning(criteria, dataToSet, { multi: true }, (err, result) => {
                            console.log("updated warnings>>>>>>>>>>>>>>>>>", result, "Errrooooooooooooor", err)
                        })
                    })
                }
            })
            // } else {
            //     let length = functionData.checkExistingWarnings.links.pendingAction.length;
            //     length = 5 - length;
            //     let array = []
            //     if (functionData.checkExistingWarnings.urlNotToIncludeInRandom.length > 0) {
            //         let urlNotToInclude = functionData.checkExistingWarnings.urlNotToIncludeInRandom
            //         for (let i = 0; i < urlNotToInclude.length; i++) {
            //             let objectId = mongoose.Types.ObjectId(urlNotToInclude[i]);
            //             array.push(objectId);
            //         }
            //     }
            //     let criteria = [
            //         {
            //             $match: {
            //                 groupId: mongoose.Types.ObjectId(data.groupId),
            //                 _id: { $nin: array }
            //             }
            //         },
            //         { $sample: { 'size': length } },
            //         {
            //             "$lookup":
            //             {
            //                 "from": "users",
            //                 "localField": "userId",
            //                 "foreignField": "_id",
            //                 "as": "data"
            //             }
            //         }
            //     ]

            //     instaLinksDAO.randomCards(criteria, (err, gotCards) => {
            //         if (err) {
            //             return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
            //         } else if (gotCards.length == 0) {
            //             let exists = functionData.checkExistingWarnings.existingLinks;
            //             exists = exists.concat(gotCards);
            //             exists = exists.slice(0, 4)
            //             return cb(null, { "statusCode": util.statusCode.CREATED, "statusMessage": util.statusMessage.ACTION_PENDING, cards: exists })
            //         } else {

            //             let exists = functionData.checkExistingWarnings.existingLinks;
            //             exists = exists.concat(gotCards);
            //             exists = exists.slice(0, 4)
            //             console.log(">>>>>>>>>>>>>>>>>>>>", gotCards, "asfgdwwwwwwwwwwwwwwwwwwwwwwwwwww", exists)
            //             cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.DATA_FETCHED, cards: exists })
            //             let criteria = {
            //                 userId: data.userId,
            //                 groupId: data.groupId
            //             }
            //             gotCards.forEach(x => {
            //                 let dataToSet = {
            //                     $addToSet: {
            //                         pendingAction: { urlId: x._id },
            //                         totalLinksProvided: { urlId: x._id }
            //                     }
            //                 }
            //                 warningDAO.updatewarning(criteria, dataToSet, { multi: true }, (err, result) => {
            //                     console.log("updated warnings>>>>>>>>>>>>>>>>>", result, "Errrooooooooooooor", err)
            //                 })
            //             })
            //         }
            //     })
            // }

        }]
    },
        (error, response) => {
            callback(response.getCards)
        })
}

let userIntraction = async (req, res, next) => {
    try {
        let { userId, groupId } = req.body;
        if (!userId || !groupId) {
            return res.send({ statusMessage: util.statusMessage.PARAMS_MISSING, statusCode: util.statusCode.FOUR_ZERO_ONE })
        } else {
            let userExist = await checkUser(userId);
            let groupExist = await checkGroup(groupId);
            console.log("DDDDDDDDDDDDDDDDdd", groupExist)
            let warningExist = await checkWarningUrl(userId, groupId)
            console.log("DFASSDFGSDFHSEWTRSEYHSDS", warningExist)
            let urlExist = await checkUrlExistence(groupId)
            if (userExist.code == 500) {
                return res.send({ statusCode: util.statusCode.FIVE_ZERO_ZERO, statusMessage: util.statusMessage.SOMETHING_WENT_WRONG })
            }
            if (userExist.code == 401) {
                return res.send({ statusCode: util.statusCode.FOUR_ZERO_ONE, statusMessage: util.statusMessage.NO_DATA })
            }
            if (groupExist.code == 500) {
                return res.send({ statusCode: util.statusCode.FIVE_ZERO_ZERO, statusMessage: util.statusMessage.SOMETHING_WENT_WRONG })
            }
            if (groupExist.code == 401) {
                return res.send({ statusCode: util.statusCode.FOUR_ZERO_ONE, statusMessage: util.statusMessage.NO_DATA })
            }
            if (warningExist.code == 500) {
                return res.send({ statusCode: util.statusCode.FIVE_ZERO_ZERO, statusMessage: util.statusMessage.SOMETHING_WENT_WRONG })
            }
            if (warningExist.code == 401) {
                return res.send({ statusCode: util.statusCode.FOUR_ZERO_ONE, statusMessage: util.statusMessage.NO_DATA })
            }
            if (urlExist.code == 500) {
                return res.send({ statusCode: util.statusCode.FIVE_ZERO_ZERO, statusMessage: util.statusMessage.SOMETHING_WENT_WRONG })
            }
            if (urlExist.code == 401) {
                next();
            }
            if (userExist.banned) {
                return res.send({ statusCode: util.statusCode.CREATED, statusMessage: util.statusMessage.BANNED })
            }
            let pendingArray = warningExist[0].pendingAction
            console.log("KKKKKKKKKKKKKKK", pendingArray)
            if (urlExist.length == 0) {
                next();
            }
            if (pendingArray.length == 0) {
                next();
            }
            if (groupExist.groupType == "LIKE") {
                pendingArray.forEach(async x => {
                    console.log("GGGGGGGGGGGGGGGGGGG", x)
                    let checkLike = await botFunction.checkLikesInstagram(req.body.instaUserName, x.urlId.url)
                    if (checkLike.liked) {
                        let criteria = {
                            userId: userExist._id,
                            groupId: groupExist._id
                        }
                        let dataToSet = {
                            $pull: {
                                pendingAction: { urlId: x.urlId._id },
                                linksBuffer: { urlId: x.urlId._id }
                            }
                        }
                        await warningDAO.updatewarning(criteria, dataToSet, {}, (err, result) => { })
                    }
                })
                await sleep(30000);
                let criteria = {
                    userId: userExist._id,
                    groupId: groupExist._id
                }
                warningDAO.getwarning(criteria, {}, {}, (err, result) => {
                    if (err) {
                        res.send({ statusCode: util.statusCode.FIVE_ZERO_ZERO, statusMessage: util.statusMessage.SOMETHING_WENT_WRONG })
                    } else {
                        if (result[0].pendingAction.length == 0) {
                            next();
                        }
                        else {
                            let current = new Date().getTime() + 7200000;
                            let previousWarningCount = result[0].remainingWarning;
                            let criteria = {
                                userId: userExist._id,
                                groupId: groupExist._id
                            }
                            let dataToSet = {
                                $set: {
                                    remainingWarning: previousWarningCount + 1,
                                    thresholdTime: current
                                }
                            }
                            warningDAO.updatewarning(criteria, dataToSet, {}, (err, result1) => {
                                if (err) {
                                    return res.send({ statusCode: util.statusCode.FIVE_ZERO_ZERO, statusMessage: util.statusMessage.SOMETHING_WENT_WRONG })
                                } else {
                                    if (result1.remainingWarning == 5) {
                                        let criteria = {
                                            _id: result1.userId,
                                            status: "ACTIVE"
                                        }
                                        let dataToSet = {
                                            $set: {
                                                banned: true
                                            }
                                        }
                                        userDAO.updateUser(criteria, dataToSet, {}, (err, bannedUser) => {
                                            if (err) {
                                                return res.send({ statusCode: util.statusCode.FIVE_ZERO_ZERO, statusMessage: util.statusMessage.SOMETHING_WENT_WRONG })
                                            } else {
                                                return res.send({ statusCode: util.statusCode.OK, statusMessage: util.statusMessage.BANNED })
                                            }
                                        })
                                    }
                                    return res.send({ statusCode: util.statusCode.OK, statusMessage: util.statusMessage.LIKE_WARNING })
                                }
                            })
                        }
                    }
                })
            }
            if (groupExist.groupType == "COMMENT") {
                pendingArray.forEach(async x => {
                    let checkComment = await botFunction.checkCommentsInstagram(userExist.instagramUser, x.urlId.url)
                    if (checkComment) {
                        let criteria = {
                            userId: userExist._id,
                            groupId: groupExist._id
                        }
                        let dataToSet = {
                            $pull: {
                                pendingAction: { urlId: x.urlId._id },
                                linksBuffer: { urlId: x.urlId._id }
                            }
                        }
                        warningDAO.updatewarning(criteria, dataToSet, {}, (err, result) => {
                        })
                    }
                })
                await sleep(5000);
                let criteria = {
                    userId: userExist._id,
                    groupId: groupExist._id
                }
                warningDAO.getwarning(criteria, {}, {}, (err, result) => {
                    if (err) {
                        return res.send({ statusCode: util.statusCode.FIVE_ZERO_ZERO, statusMessage: util.statusMessage.SOMETHING_WENT_WRONG })
                    } else {
                        if (result[0].pendingAction.length == 0) {
                            next();
                        }
                        else {
                            let current = new Date().getTime() + 7200000;
                            let previousWarningCount = result[0].remainingWarning;
                            let criteria = {
                                userId: userExist._id,
                                groupId: groupExist._id
                            }
                            let dataToSet = {
                                $set: {
                                    remainingWarning: previousWarningCount + 1,
                                    thresholdTime: current
                                }
                            }
                            warningDAO.updatewarning(criteria, dataToSet, {}, (err, result) => {
                                if (err) {
                                    return res.send({ statusCode: util.statusCode.FIVE_ZERO_ZERO, statusMessage: util.statusMessage.SOMETHING_WENT_WRONG })
                                } else {
                                    if (result1.remainingWarning == 5) {
                                        let criteria = {
                                            _id: result1.userId,
                                            status: "ACTIVE"
                                        }
                                        let dataToSet = {
                                            $set: {
                                                banned: true
                                            }
                                        }
                                        userDAO.updateUser(criteria, dataToSet, {}, (err, bannedUser) => {
                                            if (err) {
                                                return res.send({ statusCode: util.statusCode.FIVE_ZERO_ZERO, statusMessage: util.statusMessage.SOMETHING_WENT_WRONG })
                                            } else {
                                                return res.send({ statusCode: util.statusCode.OK, statusMessage: util.statusMessage.BANNED })
                                            }
                                        })
                                    }
                                    return res.send({ statusCode: util.statusCode.OK, statusMessage: util.statusMessage.LIKE_WARNING })
                                }
                            })
                        }
                    }
                })
            }
            if (groupExist.groupType == "LIKEANDCOMMENT") {
                pendingArray.forEach(async x => {
                    let checkComment = await botFunction.checkLikeAndCommentsInstagram(userExist.instagramUser, x.urlId.url)
                    if (checkComment) {
                        let criteria = {
                            userId: userExist._id,
                            groupId: groupExist._id
                        }
                        let dataToSet = {
                            $pull: {
                                pendingAction: { urlId: x.urlId._id },
                                linksBuffer: { urlId: x.urlId._id }
                            }
                        }
                        warningDAO.updatewarning(criteria, dataToSet, {}, (err, result) => {
                        })
                    }
                })
                await sleep(30000);
                let criteria = {
                    userId: userExist._id,
                    groupId: groupExist._id
                }
                warningDAO.getwarning(criteria, {}, {}, (err, result) => {
                    if (err) {
                        return res.send({ statusCode: util.statusCode.FIVE_ZERO_ZERO, statusMessage: util.statusMessage.SOMETHING_WENT_WRONG })
                    } else {
                        if (result[0].pendingAction.length == 0) {
                            next();
                        }
                        else {
                            let current = new Date().getTime() + 7200000;
                            let previousWarningCount = result[0].remainingWarning;
                            let criteria = {
                                userId: userExist._id,
                                groupId: groupExist._id
                            }
                            let dataToSet = {
                                $set: {
                                    remainingWarning: previousWarningCount + 1,
                                    thresholdTime: current
                                }
                            }
                            warningDAO.updatewarning(criteria, dataToSet, {}, (err, result) => {
                                if (err) {
                                    return res.send({ statusCode: util.statusCode.FIVE_ZERO_ZERO, statusMessage: util.statusMessage.SOMETHING_WENT_WRONG })
                                } else {
                                    if (result1.remainingWarning == 5) {
                                        let criteria = {
                                            _id: result1.userId,
                                            status: "ACTIVE"
                                        }
                                        let dataToSet = {
                                            $set: {
                                                banned: true
                                            }
                                        }
                                        userDAO.updateUser(criteria, dataToSet, {}, (err, bannedUser) => {
                                            if (err) {
                                                return res.send({ statusCode: util.statusCode.FIVE_ZERO_ZERO, statusMessage: util.statusMessage.SOMETHING_WENT_WRONG })
                                            } else {
                                                return res.send({ statusCode: util.statusCode.OK, statusMessage: util.statusMessage.BANNED })
                                            }
                                        })
                                    }
                                    return res.send({ statusCode: util.statusCode.OK, statusMessage: util.statusMessage.LIKE_WARNING })
                                }
                            })
                        }
                    }
                })
            }
        }
    } catch (error) {
        res.send({ statusMessage: util.statusMessage.SOMETHING_WENT_WRONG, statusCode: util.statusCode.FIVE_ZERO_ZERO })
    }
}

let warnReducesBot = async (req, res, next) => {
    try {
        let { userId, groupId } = req.body;
        if (!userId || !groupId) {
            return res.send({ statusMessage: util.statusMessage.PARAMS_MISSING, statusCode: util.statusCode.FOUR_ZERO_ONE })
        } else {
            let userExist = await checkUser(userId);
            let groupExist = await checkGroup(groupId);
            let warningExist = await checkWarningUrl(userId, groupId)
            let urlExist = await checkUrlExistence(groupId)
            if (userExist.code == 500) {
                return res.send({ statusCode: util.statusCode.FIVE_ZERO_ZERO, statusMessage: util.statusMessage.SOMETHING_WENT_WRONG })
            }
            if (userExist.code == 401) {
                return res.send({ statusCode: util.statusCode.FOUR_ZERO_ONE, statusMessage: util.statusMessage.NO_DATA })
            }
            if (groupExist.code == 500) {
                return res.send({ statusCode: util.statusCode.FIVE_ZERO_ZERO, statusMessage: util.statusMessage.SOMETHING_WENT_WRONG })
            }
            if (groupExist.code == 401) {
                return res.send({ statusCode: util.statusCode.FOUR_ZERO_ONE, statusMessage: util.statusMessage.NO_DATA })
            }
            if (warningExist.code == 500) {
                return res.send({ statusCode: util.statusCode.FIVE_ZERO_ZERO, statusMessage: util.statusMessage.SOMETHING_WENT_WRONG })
            }
            if (warningExist.code == 401) {
                return res.send({ statusCode: util.statusCode.FOUR_ZERO_ONE, statusMessage: util.statusMessage.NO_DATA })
            }
            if (urlExist.code == 500) {
                return res.send({ statusCode: util.statusCode.FIVE_ZERO_ZERO, statusMessage: util.statusMessage.SOMETHING_WENT_WRONG })
            }
            if (urlExist.code == 401) {
                next();
            }
            if (userExist.banned) {
                return res.send({ statusCode: util.statusCode.CREATED, statusMessage: util.statusMessage.BANNED })
            }
            // let current = new Date().getTime();
            // if(warningExist[0].thresholdTime<current){
            //     return res.send({ statusCode: util.statusCode.TWO_KNOT_TWO, statusMessage: util.statusMessage.OUT_OF_TIME })
            // }
            let bufferArray = warningExist[0].linksBuffer

            if (urlExist.length == 0) {
                next();
            }
            if (bufferArray.length == 0) {
                next();
            }
            if (groupExist.groupType == "LIKE") {
                bufferArray.forEach(async x => {
                    console.log("GGGGGGGGGGGGGGGGGGG", x)
                    let checkLike = await botFunction.checkLikesInstagram(req.body.instaUserName, x.urlId.url)
                    console.log("QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ",checkLike)
                    if (checkLike.liked) {
                        let criteria = {
                            userId: userExist._id,
                            groupId: groupExist._id
                        }
                        let dataToSet = {
                            $pull: {
                                linksBuffer: { urlId: x.urlId._id }
                            }
                        }
                        await warningDAO.updatewarning(criteria, dataToSet, {}, (err, result) => { })
                    }
                })
                await sleep(30000);
                let criteria = {
                    userId: userExist._id,
                    groupId: groupExist._id
                }
                warningDAO.getwarning(criteria, {}, {}, (err, result) => {
                    if (err) {
                        return res.send({ statusCode: util.statusCode.FIVE_ZERO_ZERO, statusMessage: util.statusMessage.SOMETHING_WENT_WRONG })
                    } else {
                        if (result[0].linksBuffer.length == 0) {
                            next();
                        }
                        else {
                            return res.send({ statusCode: util.statusCode.CREATED, statusMessage: util.statusMessage.CARD_PENDING_2LIKE })
                        }
                    }
                })
            }
            if (groupExist.groupType == "COMMENT") {
                bufferArray.forEach(async x => {
                    let checkComment = await botFunction.checkCommentsInstagram(userExist.instagramUser, x.urlId.url)
                    if (checkComment) {
                        let criteria = {
                            userId: userExist._id,
                            groupId: groupExist._id
                        }
                        let dataToSet = {
                            $pull: {
                                linksBuffer: { urlId: x.urlId._id }
                            }
                        }
                        warningDAO.updatewarning(criteria, dataToSet, {}, (err, result) => {
                        })
                    }
                })
                await sleep(5000);
                let criteria = {
                    userId: userExist._id,
                    groupId: groupExist._id
                }
                warningDAO.getwarning(criteria, {}, {}, (err, result) => {
                    if (err) {
                        return res.send({ statusCode: util.statusCode.FIVE_ZERO_ZERO, statusMessage: util.statusMessage.SOMETHING_WENT_WRONG })
                    } else {
                        if (result[0].linksBuffer.length == 0) {
                            next();
                        }
                        else {
                            return res.send({ statusCode: util.statusCode.CREATED, statusMessage: util.statusMessage.CARD_PENDING_2COMMENT })
                        }
                    }
                })
            }
            if (groupExist.groupType == "LIKEANDCOMMENT") {
                pendingArray.forEach(async x => {
                    let checkComment = await botFunction.checkLikeAndCommentsInstagram(userExist.instagramUser, x.urlId.url)
                    if (checkComment) {
                        let criteria = {
                            userId: userExist._id,
                            groupId: groupExist._id
                        }
                        let dataToSet = {
                            $pull: {
                                linksBuffer: { urlId: x.urlId._id }
                            }
                        }
                        warningDAO.updatewarning(criteria, dataToSet, {}, (err, result) => {
                        })
                    }
                })
                await sleep(30000);
                let criteria = {
                    userId: userExist._id,
                    groupId: groupExist._id
                }
                warningDAO.getwarning(criteria, {}, {}, (err, result) => {
                    if (err) {
                        return res.send({ statusCode: util.statusCode.FIVE_ZERO_ZERO, statusMessage: util.statusMessage.SOMETHING_WENT_WRONG })
                    } else {
                        if (result[0].linksBuffer.length == 0) {
                            next();
                        }
                        else {
                            return res.send({ statusCode: util.statusCode.CREATED, statusMessage: util.statusMessage.CARD_PENDING_2COMMENT })
                        }
                    }
                })
            }
        }
    } catch (error) {
        res.send({ statusMessage: util.statusMessage.SOMETHING_WENT_WRONG, statusCode: util.statusCode.FIVE_ZERO_ZERO })
    }
}

let reduceWarning = (data, callback) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            if (!data.userId) {

                cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }
            var criteria = {
                _id: data.userId,
                status: "ACTIVE",
                verified: true
            }

            userDAO.getUser(criteria, {}, {}, (err, dbData) => {
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
        checkGroupExistsinDB: (cb) => {
            if (!data.groupId) {

                return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })

            }
            var criteria = {
                _id: data.groupId,
                groupStatus: "ACTIVE"
            }
            let option = {
                populate: {
                    path: 'groupMembers.groupMember', select: 'image fullName _id'
                }
            }
            groupDAO.getGroup(criteria, {}, option, (err, groupData) => {
                if (err) {
                    return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                }

                if (groupData && groupData.length) {
                    cb(null, { result: groupData[0] });
                }
                else {
                    l("in here in706 ")
                    return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.NO_DATA });
                }

            });
        },
        checkUserExistsInGroup: (cb) => {
            if (!data.userId || !data.groupId) {
                return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })
            }
            var criteria = {
                _id: data.groupId,
                groupStatus: "ACTIVE",
                groupMembers: {
                    $elemMatch: {
                        groupMember: data.userId
                    }
                }
            }

            groupDAO.getOneGroup(criteria, (err, groupData) => {
                console.log(groupData, "post", err)

                if (err) {
                    return cb(null, { "statusCode": util.statusCode.FIVE_ZERO_ZERO, "statusMessage": util.statusMessage.SERVER_BUSY })
                }

                if (!groupData) {
                    return cb(null, { "statusCode": util.statusCode.CREATED, "statusMessage": util.statusMessage.USER_NOTINGROUP })
                }
                else {
                    cb(null, { groupData: groupData });
                }

            })
        },
        reduce: ["checkUserExistsinDB", "checkGroupExistsinDB", "checkUserExistsInGroup", (functionData, cb) => {
            if (functionData.checkUserExistsinDB && functionData.checkUserExistsinDB.statusCode) {
                return cb(null, functionData.checkUserExistsinDB);

            }
            let criteria = {
                userId: data.userId,
                groupId: data.groupId
            }
            warningDAO.getwarning(criteria, {}, {}, (err, result) => {
                if (err) {
                    return cb(null,{ statusCode: util.statusCode.FIVE_ZERO_ZERO, statusMessage: util.statusMessage.SOMETHING_WENT_WRONG })
                } else {
                    // if (result[0].linksBuffer.length == 0) {
                    //     return res.send({ statusCode: util.statusCode.CREATED, statusMessage: util.statusMessage.NO_DATA }) 
                    // }
                    // else {
                    let previousWarningCount = result[0].remainingWarning;
                    let criteria = {
                        userId: data.userId,
                        groupId: data.groupId
                    }
                    let dataToSet = {
                        $set: { remainingWarning: previousWarningCount - 1 }
                    }
                    if (previousWarningCount == 0) {
                        return cb(null,{ statusCode: util.statusCode.CREATED, statusMessage: util.statusMessage.NO_WARNINGS })
                    }
                    warningDAO.updatewarning(criteria, dataToSet, {}, (err, result) => {
                        if (err) {
                            return cb(null,{ statusCode: util.statusCode.FIVE_ZERO_ZERO, statusMessage: util.statusMessage.SOMETHING_WENT_WRONG })
                        } else {
                            // if (result1.remainingWarning == 0) {
                            return cb(null,{ statusCode: util.statusCode.OK, statusMessage: util.statusMessage.DATA_UPDATED })
                            // }
                        }
                    })
                }
                // }
            })
        }]
    },
        (error, response) => {
            callback(response.reduce)
        })
}

let uploadUrl = (data, callback) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            if (!data.userId) {

                return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })
                
            }
            var criteria = {
                _id: data.userId,
                status: "ACTIVE",
                verified: true
            }

            userDAO.getUser(criteria, {}, {}, (err, dbData) => {
                if (err) {
                    return cb(null, { "statusCode": util.statusCode.FIVE_ZERO_ZERO, "statusMessage": util.statusMessage.SERVER_BUSY })
                
                }

                if (dbData && dbData.length) {
                    cb(null, { result: dbData[0] });
                }
                else {
                    return cb(null, { "statusCode": util.statusCode.CREATED, "statusMessage": util.statusMessage.NO_DATA });
                    
                }

            });
        },
        checkGroupExistsinDB: (cb) => {
            if (!data.groupId) {

                return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })

            }
            var criteria = {
                _id: data.groupId,
                groupStatus: "ACTIVE"
            }
            let option = {
                populate: {
                    path: 'groupMembers.groupMember', select: 'image fullName _id'
                }
            }
            groupDAO.getGroup(criteria, {}, option, (err, groupData) => {
                if (err) {
                    return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                }

                if (groupData && groupData.length) {
                    cb(null, { result: groupData[0] });
                }
                else {
                    l("in here in706 ")
                    return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.NO_DATA });
                }

            });
        },
        checkUserExistsInGroup: (cb) => {
            if (!data.userId || !data.groupId) {
                return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })
            }
            var criteria = {
                _id: data.groupId,
                groupStatus: "ACTIVE",
                groupMembers: {
                    $elemMatch: {
                        groupMember: data.userId
                    }
                }
            }

            groupDAO.getOneGroup(criteria, (err, groupData) => {
                console.log(groupData, "post", err)

                if (err) {
                    return cb(null, { "statusCode": util.statusCode.FIVE_ZERO_ZERO, "statusMessage": util.statusMessage.SERVER_BUSY })
                }

                if (!groupData) {
                    return cb(null, { "statusCode": util.statusCode.CREATED, "statusMessage": util.statusMessage.USER_NOTINGROUP })
                }
                else {
                    cb(null, { groupData: groupData });
                }

            })
        },
        saveSharedLinks: ["checkUserExistsinDB", "checkGroupExistsinDB", "checkUserExistsInGroup", (functionData, cb) => {
            if (functionData.checkUserExistsinDB && functionData.checkUserExistsinDB.statusCode) {
                return cb(null, functionData.checkUserExistsinDB);

            }
            if (functionData.checkGroupExistsinDB && functionData.checkGroupExistsinDB.statusCode) {
                return cb(null, functionData.checkGroupExistsinDB);

            }
            if (functionData.checkUserExistsInGroup && functionData.checkUserExistsInGroup.statusCode) {
                return cb(null, functionData.checkUserExistsInGroup);

            }
            [0].forEach(async x => {
                let validUrl = data.url.split("?")
                validUrl = validUrl[0];
                let validity = await util.validUrl(validUrl)
                console.log("OOOOOOOOOOOOOOOO", validity)
                if (validity.length == 0) {
                    return cb(null, { "statusCode": util.statusCode.CREATED, "statusMessage": util.statusMessage.URL_NOT_FOUND });
                }
                else{
                    let groupId = functionData.checkGroupExistsinDB.result._id;
                    let data1 = {
                        userId: data.userId,
                        groupId: groupId,
                        url: validUrl,
                        instaUrl: validity.imageUrl,
                        caption: validity.caption ? validity.caption : '',
                        timeTaken: validity.time,
                        instaUserName: data.instaUserName,
                        note: data.note
                    }
                    instaLinksDAO.createInstaLinks(data1, (err, dbData) => {
                        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>",err,dbData)
                        if (err) {
                            return cb(null, { "statusCode": util.statusCode.FIVE_ZERO_ZERO, "statusMessage": util.statusMessage.SOMETHING_WENT_WRONG })
                            
                        }
                        else{
                            rewardsDAO.getRewards({rewardType:"POSTING"},{},{},(err1,result1)=>{
                                if(err1){
                                    console.log("somehing went wrong")
                                }
                                userDAO.getOneUser({_id:data.userId},(err3,result3)=>{
                                    if(err3){
                                        console.log("wrong in getting detail")
                                    }
                                    let bonus = result3.rewardPoint;
                                    bonus = bonus+result1.rewardPoint;
                                    userDAO.updateUser({_id:data.userId},{$set:{rewardPoint:bonus}},{},(err4,result4)=>{
                                        if(err4){
                                            console.log("got wrong in 134")
                                        }
                                        console.log("successfully>>>>>>>>>>>>>>>>>>>",result4)
                                        return cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.DATA_UPDATED, result: dbData })
                                    })
                                })
                            })
                            
                            
                        }
                    })
                }
                
            })

        }]
    },
        (error, response) => {
            callback(response.saveSharedLinks)
        })
}

let trendingGroup = (data, callback) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            if (!data.userId || !data.groupType) {

                cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }
            var criteria = {
                _id: data.userId,
                status: "ACTIVE",
                verified: true
            }

            userDAO.getUser(criteria, {}, {}, (err, dbData) => {
                if (err) {
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
        getTrendingGroups: ["checkUserExistsinDB", (functionData, cb) => {
            if (functionData.checkUserExistsinDB && functionData.checkUserExistsinDB.statusCode) {
                return cb(null, functionData.checkUserExistsinDB);

            }
            let criteria = {
                groupType: data.groupType
            }
            let sorting = {
                memberCount: -1
            }
            groupDAO.trendingGroup(criteria, {}, sorting, 5, (error, result) => {
                if (error) {
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY });
                }
                else if
                    (result.length == 0) {
                    cb(null, { "statusCode": util.statusCode.CREATED, "statusMessage": util.statusMessage.NO_DATA });
                }
                else {
                    cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.DATA_FETCHED, groups: result });
                }
            })
        }]
    },
        (error, response) => {
            callback(response.getTrendingGroups)
        })
}

let upComingEvent = (data, callback) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            if (!data.userId) {

                return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })

            }
            var criteria = {
                _id: data.userId,
                status: "ACTIVE",
                verified: true
            }

            userDAO.getUser(criteria, {}, {}, (err, dbData) => {
                if (err) {
                    return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })

                }

                if (dbData && dbData.length) {
                    cb(null, { result: dbData[0] });
                }
                else {
                    return cb(null, { "statusCode": util.statusCode.CREATED, "statusMessage": util.statusMessage.NO_DATA });

                }

            });
        },
        getUpcomingEvents: ["checkUserExistsinDB", (functionData, cb) => {
            if (functionData.checkUserExistsinDB && functionData.checkUserExistsinDB.statusCode) {
                return cb(null, functionData.checkUserExistsinDB);

            }
            let now = Date.now();
            let criteria = {
                startDate: { $gt: now },
                eventStatus: "ACTIVE"
            }
            let option = {
                populate: {
                    path: 'eventMembers.eventMember', select: 'image fullName _id'
                }
            }
            eventDAO.getEvent(criteria, {}, option, (error, result) => {
                if (error) {
                    cb(null, { "statusCode": util.statusCode.NINE, "statusMessage": util.statusMessage.SERVER_BUSY });
                }
                else if (result.length == 0) {
                    cb(null, { "statusCode": util.statusCode.CREATED, "statusMessage": util.statusMessage.NO_DATA });
                }
                else {
                    cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.DATA_FETCHED, event: result });
                }
            })
        }]
    },
        (error, response) => {
            callback(response.getUpcomingEvents)
        })
}

let chatAndVerifiedGroup = (data, callback) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            if (!data.userId) {

                return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })

            }
            var criteria = {
                _id: data.userId,
                status: "ACTIVE",
                verified: true
            }

            userDAO.getUser(criteria, {}, {}, (err, dbData) => {
                if (err) {
                    return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })

                }

                if (dbData && dbData.length) {
                    cb(null, { result: dbData[0] });
                }
                else {
                    return cb(null, { "statusCode": util.statusCode.CREATED, "statusMessage": util.statusMessage.NO_DATA });

                }

            });
        },
        chatAndVerifiedGroups: ["checkUserExistsinDB", (functionData, cb) => {
            if (functionData.checkUserExistsinDB && functionData.checkUserExistsinDB.statusCode) {
                return cb(null, functionData.checkUserExistsinDB);

            }
            let criteria = {
                groupType: { $in: ["CHAT", "VERIFIEDUSERS"] }
            }

            groupDAO.getGroup(criteria, {}, {}, (error, result) => {
                if (error) {
                    cb(null, { "statusCode": util.statusCode.NINE, "statusMessage": util.statusMessage.SERVER_BUSY });
                }
                else if
                    (result.length == 0) {
                    cb(null, { "statusCode": util.statusCode.CREATED, "statusMessage": util.statusMessage.NO_DATA });
                }
                else {
                    cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.DATA_FETCHED, groups: result });
                }
            })


        }]
    },
        (error, response) => {
            callback(response.chatAndVerifiedGroups)
        })
}

let homeData = (data, callback) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            if (!data.userId) {

                return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })

            }
            var criteria = {
                _id: data.userId,
                status: "ACTIVE",
                verified: true
            }

            userDAO.getUser(criteria, {}, {}, (err, dbData) => {
                if (err) {
                    return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })

                }

                if (dbData && dbData.length) {
                    cb(null, { result: dbData[0] });
                }
                else {
                    console.log("sdfjhvfsfgas>>>>>>>>>>>>>>>>")
                    return cb(null, { "statusCode": util.statusCode.CREATED, "statusMessage": util.statusMessage.NO_DATA });

                }

            });
        },
        usersHomeData: ["checkUserExistsinDB", (functionData, cb) => {
            if (functionData.checkUserExistsinDB && functionData.checkUserExistsinDB.statusCode) {
                return cb(null, functionData.checkUserExistsinDB);

            } else {

                [0].forEach(async ele => {
                    if (data.groupType == null || data.groupType == "" || data.groupType == undefined) {

                        data.groupType = "LIKE"
                    }
                    let trendingGroup = await trendingGroup1(data.groupType);
                    let chatAndVerifiedGroup = await chatAndVerifiedGroup1();
                    let upComingEvent = await upComingEvent1(data.userId);
                    let instaBasicProfile = await util.instaBasicProfile(functionData.checkUserExistsinDB.result.instagramUser)
                    let { totalLikes, totalComments, engagements } = instaBasicProfile
                    let howTo = await getHowToUse();
                    let tips = await tipsAndTrick();
                    let home = {
                        trendingGroup: trendingGroup,
                        chatAndVerifiedGroup: chatAndVerifiedGroup,
                        upComingEvent: upComingEvent,
                        // instaBasicProfile: instaBasicProfile,
                        howToUse: howTo,
                        totalLikes: totalLikes,
                        totalComments: totalComments,
                        engagements: engagements,
                        tipsAndTricks: tips,
                        rewardPoint: functionData.checkUserExistsinDB.result.rewardPoint
                    }

                    cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.DATA_FETCHED, homeData: home });
                })
            }


        }]
    },
        (error, response) => {
            callback(response.usersHomeData)
        })
}

let getUserAnalytics = (data, callback) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            console.log(">>>>>>>>>>>>>>>", data)
            if (!data.userId) {

                return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })

            }
            var criteria = {
                _id: data.userId,
                status: "ACTIVE"
            }

            userDAO.getUser(criteria, {}, {}, (err, dbData) => {
                if (err) {
                    return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })

                }

                if (dbData && dbData.length) {
                    let dataToFind = {
                        userId: data.userId
                    }
                    instagramUserDao.getOneInstagram(dataToFind, (err, result) => {
                        console.log("OIUYTREWLKJHGFDSA", err, result)
                        if (err) {
                            console.log("Error", err)
                        }
                        else if (result) {
                            if (result.details) {

                                cb(null, { result: dbData[0] });
                            }
                            else {
                                [0].forEach(async x => {

                                    let instaUser = await util.instaBasicProfile(dbData[0].instagramUser);


                                    let objToCreate = {

                                        userId: data.userId,
                                        profilePic: instaUser.profilePic ? instaUser.profilePic : '',
                                        username: instaUser.username ? instaUser.username : data.instagramUser,
                                        totalLikes: instaUser.totalLikes ? instaUser.totalLikes : 0,
                                        totalComments: instaUser.totalComments ? instaUser.totalComments : 0,
                                        totalFollowers: instaUser.followers ? instaUser.followers : 0,
                                        following: instaUser.following ? instaUser.following : 0,
                                        timeTaken: instaUser.timeTaken ? instaUser.timeTaken : 0,
                                        biography: instaUser.biography ? instaUser.biography : '',
                                        totalPost: instaUser.totalPost ? instaUser.totalPost : 0,
                                        engagements: instaUser.engagements ? instaUser.engagements : '',
                                        isVerified: instaUser.isVerified ? instaUser.isVerified : false,
                                        businessAccount: instaUser.businessAccount ? instaUser.businessAccount : false,
                                        topPost: instaUser.topPost ? instaUser.topPost : [],
                                        details: instaUser.details ? instaUser.details : false
                                    }
                                    instagramUserDao.createInstagram(objToCreate, (err, result) => {
                                        console.log(">>>>>>>>>>>>>>>>>>>>>>>", err, result)
                                        cb(null, { result: dbData[0] });
                                    })


                                })
                            }
                        }
                        else {
                            [0].forEach(async x => {

                                let instaUser = await util.instaBasicProfile(dbData[0].instagramUser);
                                console.log("jhfgsdjhfhkajdsgfilaksdga", instaUser)
                                // if (instaUser.details) {

                                let objToCreate = {

                                    userId: data.userId,
                                    profilePic: instaUser.profilePic ? instaUser.profilePic : '',
                                    username: instaUser.username ? instaUser.username : data.instagramUser,
                                    totalLikes: instaUser.totalLikes ? instaUser.totalLikes : 0,
                                    totalComments: instaUser.totalComments ? instaUser.totalComments : 0,
                                    totalFollowers: instaUser.followers ? instaUser.followers : 0,
                                    following: instaUser.following ? instaUser.following : 0,
                                    timeTaken: instaUser.timeTaken ? instaUser.timeTaken : 0,
                                    biography: instaUser.biography ? instaUser.biography : '',
                                    totalPost: instaUser.totalPost ? instaUser.totalPost : 0,
                                    engagements: instaUser.engagements ? instaUser.engagements : '',
                                    isVerified: instaUser.isVerified ? instaUser.isVerified : false,
                                    businessAccount: instaUser.businessAccount ? instaUser.businessAccount : false,
                                    topPost: instaUser.topPost ? instaUser.topPost : [],
                                    details: instaUser.details ? instaUser.details : false
                                }
                                instagramUserDao.createInstagram(objToCreate, (err, result) => {
                                    console.log(">>>>>>>>>>>>>>>>>>>>>>>", err, result)
                                    cb(null, { result: dbData[0] });
                                })
                                // } else {
                                //     cb(null, { result: dbData[0] });
                                // }
                            })
                        }


                    })
                }
                else {
                    console.log("hkjsdgfuisadga")
                    return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.NO_DATA });

                }

            });
        },
        analyticsData: ["checkUserExistsinDB", (functionData, cb) => {
            if (functionData.checkUserExistsinDB && functionData.checkUserExistsinDB.statusCode) {
                return cb(null, functionData.checkUserExistsinDB);

            } else {
                let dataToFind = {
                    userId: data.userId
                }
                instagramUserDao.getOneInstagram(dataToFind, (err, result) => {
                    if (err) {
                        return cb(null, { "statusCode": util.statusCode.FIVE_ZERO_ZERO, "statusMessage": util.statusMessage.SERVER_BUSY });
                    }
                    // if (!result) {
                    //     return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.NO_DATA });
                    // }

                    if (data.token) {
                        [0].forEach(async ele => {
                            let instaBasicProfile = await util.instaBasicProfile(functionData.checkUserExistsinDB.result.instagramUser);
                            let insights = await util.usersInsight(data.token);
                            let mentions = await util.userTopMentions(data.token);
                            let rewardsPoint = functionData.checkUserExistsinDB.result.rewardPoint
                            let likesGained = instaBasicProfile.totalLikes - result.totalLikes;
                            let commentsGained = instaBasicProfile.totalComments - result.totalComments;
                            let followersGained = instaBasicProfile.followers - result.totalFollowers;
                            let stats = [
                                {
                                    likesGained: likesGained
                                },
                                {
                                    commentsGained: commentsGained
                                },
                                {
                                    followersGained: followersGained
                                }
                            ]
                            let averageStats = [
                                {
                                    averageLikes: instaBasicProfile.averageLikes
                                },
                                {
                                    averageComments: instaBasicProfile.averageComments
                                },
                                {
                                    averageEngagements: instaBasicProfile.averageEngagements
                                }
                            ]
                            let obj = {
                                instaBasicProfile: instaBasicProfile,
                                insights: insights,
                                mentions: mentions,
                                stats: stats,
                                rewardsPoint: rewardsPoint,
                                averageStats: averageStats,
                                subscribed: functionData.checkUserExistsinDB.result.subscribed ? functionData.checkUserExistsinDB.result.subscribed : false,
                                facebookLoginStatus: functionData.checkUserExistsinDB.result.facebookLoginStatus ? functionData.checkUserExistsinDB.result.facebookLoginStatus : 0,
                                googleLoginStatus: functionData.checkUserExistsinDB.result.googleLoginStatus ? functionData.checkUserExistsinDB.result.googleLoginStatus : 0
                            }
                            cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.DATA_FETCHED, instaData: obj });

                        })
                    }
                    else {
                        [0].forEach(async ele => {
                            let instaBasicProfile = await util.instaBasicProfile(functionData.checkUserExistsinDB.result.instagramUser)
                            let rewardsPoint = functionData.checkUserExistsinDB.result.rewardPoint
                            let likesGained = instaBasicProfile.totalLikes - result.totalLikes;
                            let commentsGained = instaBasicProfile.totalComments - result.totalComments;
                            let followersGained = instaBasicProfile.followers - result.totalFollowers;
                            let stats = [
                                {
                                    likesGained: likesGained
                                },
                                {
                                    commentsGained: commentsGained
                                },
                                {
                                    followersGained: followersGained
                                }
                            ]
                            let averageStats = [
                                {
                                    averageLikes: instaBasicProfile.averageLikes
                                },
                                {
                                    averageComments: instaBasicProfile.averageComments
                                },
                                {
                                    averageEngagements: instaBasicProfile.averageEngagements
                                }
                            ]
                            let obj = {
                                instaBasicProfile: instaBasicProfile,
                                stats: stats,
                                rewardsPoint: rewardsPoint,
                                averageStats: averageStats,
                                subscribed: functionData.checkUserExistsinDB.result.subscribed ? functionData.checkUserExistsinDB.result.subscribed : false,
                                facebookLoginStatus: functionData.checkUserExistsinDB.result.facebookLoginStatus ? functionData.checkUserExistsinDB.result.facebookLoginStatus : 0,
                                googleLoginStatus: functionData.checkUserExistsinDB.result.googleLoginStatus ? functionData.checkUserExistsinDB.result.googleLoginStatus : 0

                            }
                            cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.DATA_FETCHED, instaData: obj });
                        })
                    }

                })
            }


        }]
    },
        (error, response) => {
            callback(response.analyticsData)
        })
}

let contactUs = (data, callback) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            if (!data.userId) {

                return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })

            }
            var criteria = {
                _id: data.userId,
                status: "ACTIVE",
                verified: true
            }

            userDAO.getUser(criteria, {}, {}, (err, dbData) => {
                if (err) {
                    return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })

                }

                if (dbData && dbData.length) {
                    cb(null, { result: dbData[0] });
                }
                else {
                    return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.NO_DATA });

                }

            });
        },
        contactUsUser: ["checkUserExistsinDB", (functionData, cb) => {
            if (functionData.checkUserExistsinDB && functionData.checkUserExistsinDB.statusCode) {
                return cb(null, functionData.checkUserExistsinDB);

            } else {
                let criteria1 = {
                    userId: functionData.checkUserExistsinDB.result._id,
                    phone: data.phone,
                    description: data.description,
                    countryCode: data.countryCode,
                    subject: data.subject,
                    mergedContact: data.countryCode + data.phone
                }
                contactUsDAO.createcontactUs(criteria1, (err, result) => {
                    if (err) {
                        return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                    }
                    return cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.DATA_UPDATED, query: result })
                })
            }


        }]
    },
        (error, response) => {
            callback(response.contactUsUser)
        })
}

let uploadUrlInEvents = (data, callback) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            if (!data.userId) {

                cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }
            var criteria = {
                _id: data.userId,
                status: "ACTIVE",
                verified: true
            }

            userDAO.getUser(criteria, {}, {}, (err, dbData) => {
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
        checkEventExistsinDB: (cb) => {
            if (!data.eventId) {

                return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })

            }
            var criteria = {
                _id: data.eventId,
                eventStatus: "ACTIVE"
            }
            let option = {
                populate: {
                    path: 'eventMembers.eventMember', select: 'image fullName _id'
                }
            }
            eventDAO.getEvent(criteria, {}, option, (err, eventData) => {
                if (err) {
                    return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.SERVER_BUSY })
                }

                if (eventData && eventData.length) {
                    let now = new Date().getTime();
                    if (eventData[0].startDate > now) {
                        return cb(null, { "statusCode": util.statusCode.CREATED, "statusMessage": util.statusMessage.EVENT_NOT_START })
                    }
                    if (eventData[0].endDate < now) {
                        return cb(null, { "statusCode": util.statusCode.CREATED, "statusMessage": util.statusMessage.EVENT_EXPIRE })
                    }
                    cb(null, { result: eventData[0] });
                }
                else {
                    l("in here in706 ")
                    return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.NO_DATA });
                }

            });
        },
        checkUserExistsInEvent: (cb) => {
            if (!data.userId || !data.eventId) {
                return cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })
            }
            var criteria = {
                _id: data.eventId,
                eventStatus: "ACTIVE",
                eventMembers: {
                    $elemMatch: {
                        eventMember: data.userId
                    }
                }
            }

            eventDAO.getOneEvent(criteria, (err, eventData) => {
                if (err) {
                    return cb(null, { "statusCode": util.statusCode.FIVE_ZERO_ZERO, "statusMessage": util.statusMessage.SERVER_BUSY })
                }

                if (!eventData) {
                    return cb(null, { "statusCode": util.statusCode.CREATED, "statusMessage": util.statusMessage.NO_DATA })
                }
                else {
                    cb(null, { eventData: eventData });
                }

            })
        },
        saveSharedLinks: ["checkUserExistsinDB", "checkEventExistsinDB", "checkUserExistsInEvent", (functionData, cb) => {
            if (functionData.checkUserExistsinDB && functionData.checkUserExistsinDB.statusCode) {
                return cb(null, functionData.checkUserExistsinDB);

            }
            if (functionData.checkEventExistsinDB && functionData.checkEventExistsinDB.statusCode) {
                return cb(null, functionData.checkEventExistsinDB);

            }
            if (functionData.checkUserExistsInEvent && functionData.checkUserExistsInEvent.statusCode) {
                return cb(null, functionData.checkUserExistsInEvent);

            }
            [0].forEach(async x => {
                let validUrl = data.url.split("?")
                validUrl = validUrl[0];
                let validity = await util.validUrl(validUrl)
                if (validity.length == 0) {
                    return cb(null, { "statusCode": util.statusCode.CREATED, "statusMessage": util.statusMessage.URL_NOT_FOUND });
                }
                let eventId = functionData.checkEventExistsinDB.result._id;
                let data1 = {
                    userId: data.userId,
                    eventId: eventId,
                    url: validUrl,
                    instaUrl: validity.imageUrl,
                    caption: validity.caption ? validity.caption : '',
                    timeTaken: validity.time,
                    instaUserName: data.instaUserName,
                    note: data.note
                }
                instaLinksEventsDAO.createInstalinksEvents(data1, (err, dbData) => {
                    if (err) {
                        cb(null, { "statusCode": util.statusCode.FIVE_ZERO_ZERO, "statusMessage": util.statusMessage.SOMETHING_WENT_WRONG })
                        return;
                    }
                    cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.DATA_UPDATED, result: dbData });

                })
            })

        }]
    },
        (error, response) => {
            callback(response.saveSharedLinks)
        })
}


let getRewardsDetail = (data, callback) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            if (!data.userId) {

                cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }
            var criteria = {
                _id: data.userId,
                status: "ACTIVE",
                verified: true
            }

            userDAO.getUser(criteria, {}, {}, (err, dbData) => {
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
        getRewardsDetails: ["checkUserExistsinDB", (functionData, cb) => {
            if (functionData.checkUserExistsinDB && functionData.checkUserExistsinDB.statusCode) {
                return cb(null, functionData.checkUserExistsinDB);

            }
            [0].forEach(async x => {
                // let now = new Date().getTime()
                let today =new Date().getTime()
                console.log("?WWWWWWWWWWWWWWWWWW",today)
                // var now = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0).getTime();
              rewardsCardDAO.getRewardsCard({timeStamp:{$gte:today}},{},{},(err,result)=>{console.log("QQQQQQQQQQQQQQQQQQQ",err,result)
                  if(err){
                   return cb(null, { "statusCode": util.statusCode.FIVE_ZERO_ZERO, "statusMessage": util.statusMessage.SERVER_BUSY }) 
                  }
                  else if(result.length==0){
                    let user = {
                        name:functionData.checkUserExistsinDB.result.fullName,
                        rewardPoins:functionData.checkUserExistsinDB.result.rewardPoint,
                        rewardCards:[]
                    }
                    return cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.NO_DATA ,result:user})   
                  }else{
                      if(functionData.checkUserExistsinDB.result.claimedId && functionData.checkUserExistsinDB.result.claimedId.length){
                        let claimedCards = functionData.checkUserExistsinDB.result.claimedId
                        let newResult = []
                        for (let i=0;i<claimedCards.length;i++){
                            for (let j=0;j<result.length;j++){
                                let obj=Object.assign({},result[j])
                                if(claimedCards[i]==result[j]._id){
                                    console.log("DDDDDDDDDD")
                                   obj.claimed=true;
                                   console.log(">>>>>>>>>>>>>>>>>>>",obj)
                                   newResult.push(obj)
                                }
                                else{
                                    console.log("SSssssssss")
                                    obj.claimed=false;
                                    newResult.push(obj)
                                }
                            }
                        }
                        let latest = [];
                        let newTime = new Date().getTime();
                        for (let k=0;k<newResult.length;k++){
                            if(newResult[k].timeStamp>=newTime){
                                console.log("GGGGGGGGGGGGGGG",newTime,newResult[k])
                                latest.push(newResult[k]);
                            }else{
                                return;
                            }
                        }
                        console.log("XXXXXXXXXXXXXXXXXXXXX",latest)
                        let user = {
                            name:functionData.checkUserExistsinDB.result.fullName,
                            rewardPoins:functionData.checkUserExistsinDB.result.rewardPoint,
                            rewardCards:latest
                        }

                        return cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.DATA_FETCHED , result:user })
                      }
                      else{
                          let newResult=[];
                        for (let j=0;j<result.length;j++){
                            let obj=Object.assign({},result[j])
                            console.log("SSssssssss")
                                obj.claimed=false;
                                newResult.push(obj);
                        }
                        let latest = [];
                        let newTime = new Date().getTime();
                        for (let k=0;k<newResult.length;k++){
                            if(newResult[k].timeStamp>=newTime){
                                latest.push(newResult[k]);
                            }
                        }
                          let user = {
                              name:functionData.checkUserExistsinDB.result.fullName,
                              rewardPoins:functionData.checkUserExistsinDB.result.rewardPoint,
                              rewardCards:latest
                          }

                          return cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.DATA_FETCHED , result:user })
                      }
                  }
              })
            })

        }]
    },
        (error, response) => {
            callback(response.getRewardsDetails)
        })
}

let claimPoints = (data, callback) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            if (!data.userId) {

                cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ONE, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }
            var criteria = {
                _id: data.userId,
                status: "ACTIVE",
                verified: true
            }

            userDAO.getUser(criteria, {}, {}, (err, dbData) => {
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
        claimPoint: ["checkUserExistsinDB", (functionData, cb) => {
            if (functionData.checkUserExistsinDB && functionData.checkUserExistsinDB.statusCode) {
                return cb(null, functionData.checkUserExistsinDB);

            }
            [0].forEach(async x => {
              rewardsCardDAO.getRewardsCard({_id:data.cardId},{},{},(err,result)=>{
                  if(err){
                   return cb(null, { "statusCode": util.statusCode.FIVE_ZERO_ZERO, "statusMessage": util.statusMessage.SERVER_BUSY }) 
                  }
                  else if(result.length==0){
                    return cb(null, { "statusCode": util.statusCode.CREATED, "statusMessage": util.statusMessage.NO_DATA })   
                  }else{
                      let reward = functionData.checkUserExistsinDB.result
                      let newValue = reward.rewardPoint - result[0].rewardPoint
                    //   console.log("KKKKKKKKKKKKKKKKKKKKK",result, functionData.checkUserExistsinDB, reward  , newValue , reward.rewardPoint,result.rewardPoint)
                      if(reward.rewardPoint>=result[0].rewardPoint){
                          userDAO.updateUser({_id:reward._id},{$set:{rewardPoint:newValue},$addToSet:{claimedId:data.cardId}},{},(err,result)=>{
                              if(err){
                                return cb(null, { "statusCode": util.statusCode.FIVE_ZERO_ZERO, "statusMessage": util.statusMessage.SERVER_BUSY })
                              }
                              return cb(null, { "statusCode": util.statusCode.OK, "statusMessage": "Points successfully recieved successfully" })
                          })
                      }else{

                          return cb(null, { "statusCode": util.statusCode.CREATED, "statusMessage": "You dont have enough points to redeem" })
                      }
                  }
              })
            })

        }]
    },
        (error, response) => {
            callback(response.claimPoint)
        })
}





function tipsAndTrick() {
    return new Promise((resolve, reject) => {
        let criteria = {}
        let option = {
            sort: { createdAt: -1 },
            populate: { path: 'createrId', select: 'image _id fullName' }
        }
        tipsAndTricksDAO.gettipsAndTricks(criteria, {}, option, (err,result) => {
            if (err) {
                resolve([])
            } else if (result.length == 0) {
                resolve([])
            } else {
                resolve(result)
            }
        })

    })
}

function getRules() {
    return new Promise((resolve, reject) => {
        let criteria = {
            status: "ACTIVE"
        }

        rulesAndRegulationDAO.getRules(criteria, {}, {}, (err, result) => {
            if (err) {
                resolve([])
            } else if (result.length == 0) {
                resolve([])
            } else {
                resolve(result)
            }
        })

    })
}

function trendingGroup1(type) {
    return new Promise((resolve, reject) => {
        let criteria = {
            groupType: type,
            groupStatus:"ACTIVE"
        }
        let sorting = {
            memberCount: -1
        }
        groupDAO.trendingGroup(criteria, {}, sorting, 20, (error, result) => {
            if (error) {
                resolve([]);
            }
            else if (result.length == 0) {
                resolve([]);
            }
            else {
                let newResult=[];
                for(let i=0;i<result.length;i++){
                    let x=result[i];
                    let member = x.groupMembers;
                    var memberCount=0;
                    let obj ={};
                    obj.groupStatus=x.groupStatus;
                    obj.groupPic=x.groupPic;
                    obj.coverPic=x.coverPic;
                    obj._id=x._id;
                    obj.createrId=x.createrId;
                    obj.groupName=x.groupName;
                    obj.groupType=x.groupType;
                    obj.createdAt=x.createdAt;
                    obj.updatedAt=x.updatedAt;
                    obj.memberCount=0;
                    let groupMembers=[]
                   for(let j=0;j<member.length;j++){
                        let id = member[j].groupMember;
                        let y=member[j];
                        userDAO.getOneUser({_id:id},(err,result)=>{
                            if(result){
                               groupMembers.push(y);
                               obj.memberCount=obj.memberCount+1;
                            }
                        })
                    }
                    obj.groupMembers=groupMembers;
                    // obj.memberCount=memberCount;
                    newResult.push(obj);
                    

                }
                resolve(newResult);
            }
        })

    })
}

function upComingEvent1(userId) {
    return new Promise((resolve, reject) => {
        let today =new Date();
        var now = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0).getTime();

        let criteria = {
            startDate: { $gte: now },
            eventStatus: "ACTIVE"
        }
        let option = {
            populate: {
                path: 'eventMembers.eventMember', select: 'image'
            }
        }
        eventDAO.getEvent(criteria, {}, option, (error, result) => {
            if (error) {
                resolve([]);
            }
            else if (result.length == 0) {
                resolve([]);
            }
            else {
                let eventsArray = result;
                let newData = []
                for (let i = 0; i < eventsArray.length; i++) {
                    let obj = Object.assign({},eventsArray[i])
                    var criteria = {
                        _id: eventsArray[i]._id,
                        eventStatus: "ACTIVE",
                        eventMembers: {
                            $elemMatch: {
                                eventMember: userId
                            }
                        }
                    }

                    eventDAO.getOneEvent(criteria, (err, eventData) => {
                        console.log(eventData, "post", err)
                        if (err) {
                            resolve([])
                        }

                        if (!eventData) {
                            obj.isMember = false;
                            newData.push(obj)
                            obj = Object.assign({},{})
                        }
                        else {
                            obj.isMember = true;
                            newData.push(obj)
                            obj = Object.assign({},{})
                        }

                    })
                }
                console.log("WWWWWWWWWWWWWWWWWWWWWW",newData)
                resolve(newData);
            }
        })

    })
}

function chatAndVerifiedGroup1() {
    return new Promise((resolve, reject) => {
        let criteria = {
            groupType: { $in: ["CHAT", "VERIFIEDUSERS"] }
        }

        groupDAO.getGroup(criteria, {}, {}, (error, result) => {
            if (error) {
                resolve([]);
            }
            else if (result.length == 0) {
                resolve([]);
            }
            else {
                resolve(result);
            }
        })

    })
}

function checkUser(userId) {
    return new Promise((resolve, reject) => {
        let criteria = {
            _id: userId,
            status: "ACTIVE"
        }
        console.log(criteria)
        userDAO.getOneUser(criteria, (error, result) => {
            console.log("XXXXXXXXXXXXXXXXXXXXX", error, result)
            if (error) {
                resolve({ code: 500 });
            }
            else if (result.length == 0) {
                resolve({ code: 401 });
            }
            else {
                resolve(result);
            }
        })

    })
}

function checkGroup(groupId) {
    return new Promise((resolve, reject) => {
        let criteria = {
            _id: groupId,
            groupStatus: "ACTIVE"
        }

        groupDAO.getOneGroup(criteria, (error, result) => {
            if (error) {
                resolve({ code: 500 });
            }
            else if (!result) {
                resolve({ code: 401 });
            }
            else {
                resolve(result);
            }
        })

    })
}

function checkWarningUrl(userId, groupId) {
    return new Promise((resolve, reject) => {
        let criteria = {
            userId: userId,
            groupId: groupId
        }
        let option = {
            populate: { path: 'pendingAction.urlId linksBuffer.urlId', select: '_id url' }
        }
        warningDAO.getwarning(criteria, {}, option, (error, result) => {
            if (error) {
                resolve({ code: 500 });
            }
            else if (result.length == 0) {
                resolve({ code: 401 });
            }
            else {
                resolve(result);
            }
        })

    })
}

function checkUrlExistence(groupId) {
    return new Promise((resolve, reject) => {
        let criteria = {
            groupId: groupId
        }
        instaLinksDAO.getInstaLinks(criteria, {}, {}, (error, result) => {
            if (error) {
                resolve({ code: 500 });
            }
            else if (result.length == 0) {
                resolve({ code: 401 });
            }
            else {
                resolve(result);
            }
        })

    })
}

function checkWarnings(userId, groupId) {
    return new Promise((resolve, reject) => {
        let criteria = {
            userId: userId,
            groupId: groupId
        }
        let option = {
            populate: {
                path: 'linksBuffer.urlId',
                populate : { 
                    path:'userId',
                    select :'fullName image'
                }
            }
        }
        warningDAO.getwarning(criteria, {}, option, (error, result) => {
            if (error) {
                resolve({
                    "totalLinksProvided": 0,
                    "pendingAction": 0,
                    "remainingWarnings": 0,
                    "showPendingAction": []
                });
            }
            else if (result.length == 0) {
                resolve({
                    "totalLinksProvided": 0,
                    "pendingAction": 0,
                    "remainingWarnings": 0,
                    "showPendingAction": []
                });
            }
            else {
                let obj = {
                    totalLinksProvided: result[0].totalLinksProvided.length,
                    pendingAction: result[0].pendingAction.length,
                    remainingWarnings: result[0].remainingWarning,
                    showPendingAction: result[0].linksBuffer,
                    thresholdTime:result[0].thresholdTime?result[0].thresholdTime:0
                }
                resolve(obj);
            }
        })

    })
}

function getHowToUse() {
    return new Promise((resolve, reject) => {
        let criteria = {}

        videoDAO.getVideo(criteria, {}, {}, (error, result) => {
            if (error) {
                resolve([]);
            }
            else if (result.length == 0) {
                resolve([]);
            }
            else {
                resolve(result);
            }
        })

    })
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
    signup: signup,
    login: login,
    completeProfile: completeProfile,
    loginWithFacebook: loginWithFacebook,
    loginWithGoogle: loginWithGoogle,
    forgotPassword: forgotPassword,
    verifyForgotPasswordLink: verifyForgotPasswordLink,
    resetPassword: resetPassword,
    otpVerify: otpVerify,
    verifyEmailLink: verifyEmailLink,
    getProfile: getProfile,
    joinGroup: joinGroup,
    instaUserAnalytics: instaUserAnalytics,
    searchGroup: searchGroup,
    joinEvent: joinEvent,
    searchEvent: searchEvent,
    hashTagSearch: hashTagSearch,
    uploadUrl: uploadUrl,
    updateUser: updateUser,
    trendingGroup: trendingGroup,
    upComingEvent: upComingEvent,
    chatAndVerifiedGroup: chatAndVerifiedGroup,
    showCards: showCards,
    homeData: homeData,
    allHashTag: allHashTag,
    groupDetail: groupDetail,
    getUserAnalytics: getUserAnalytics,
    changePassword: changePassword,
    hashTagCategory: hashTagCategory,
    contactUs: contactUs,
    resendOtp: resendOtp,
    userIntraction: userIntraction,
    reduceWarning: reduceWarning,
    warnReducesBot: warnReducesBot,
    uploadUrlInEvents: uploadUrlInEvents,
    getRewardsDetail:getRewardsDetail,
    claimPoints:claimPoints,
    onlyVerifiedGroups:onlyVerifiedGroups
};
