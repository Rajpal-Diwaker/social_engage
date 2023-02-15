let user = require('../Models/User')
let jwt = require("jsonwebtoken");
let responseMessage = require("../Utilities/util").statusMessage;
let statusCode = require("../Utilities/util").statusCode;
let config = require('../Utilities/config').config;

module.exports = {
    basicAuthUser: function (req, res, next) {
        try {
            let { token } = req.body;
            if (!token) {
                res.send({ responseMessage: responseMessage.PARAMS_MISSING, responseCode: statusCode.FOUR_ZERO_ONE })
            } else {
                jwt.verify(token, config.SECURITY_KEY.KEY, (err, result) => {
                    if (err) {
                        res.send({ responseMessage: responseMessage.SOMETHING_WENT_WRONG, responseCode: statusCode.FIVE_ZERO_ZERO })
                    } else if (!result) {
                        res.send({ responseMessage: responseMessage.NO_DATA, responseCode: statusCode.FOUR_ZERO_ONE })
                    } else {
                        var decoded = jwt.decode(token);
                        if (result._id) {
                            user.findOne({ _id: result._id }, (error, userDetails) => {
                                if (error) {
                                    res.send({ responseMessage: responseMessage.SOMETHING_WENT_WRONG, responseCode: statusCode.FIVE_ZERO_ZERO })
                                } else if (!userDetails) {
                                    res.send({ responseMessage: responseMessage.NO_DATA, responseCode: statusCode.FOUR_ZERO_ONE })
                                } else {
                                    if (userDetails.status == "BLOCK") {
                                        res.send({ responseMessage: responseMessage.USER_BLOCKED, responseCode: statusCode.FOUR_ZERO_ONE })
                                    } else if (userDetails.status == "DELETE") {
                                        res.send({ responseMessage: responseMessage.NO_DATA, responseCode: statusCode.FOUR_ZERO_ONE })
                                    } else {
                                        next();
                                    }
                                }
                            });
                        } else {
                            res.send({ responseMessage: responseMessage.NO_DATA, responseCode: statusCode.FOUR_ZERO_ONE })
                        }
                    }
                });
            }
        } catch (error) {
            res.send({ responseMessage: responseMessage.SOMETHING_WENT_WRONG, responseCode: statusCode.FIVE_ZERO_ZERO })
        }
    }
}
