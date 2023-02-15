let express = require('express'),
    router = express.Router(),
    util = require('../Utilities/util'),
    fileExtension = require('file-extension'),
    multer = require('multer'),
    crypto = require('crypto'),
    userService = require('../Services/userService'),
    botHandler = require('../Services/userService').userIntraction,
    botHandler2 = require('../Services/userService').warnReducesBot,
    authHandler = require('../authHandler/auth').basicAuthUser;


let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/profile')
    },
    filename: function (req, file, cb) {
        crypto.pseudoRandomBytes(16, function (err, raw) {
            if (fileExtension(file.mimetype) == "form-data") {
                cb(null, raw.toString('hex') + Date.now() + '.png');
            }
            else {
                cb(null, raw.toString('hex') + Date.now() + '.' + fileExtension(file.mimetype));
            }
        });
    }
});

let upload = multer({ storage: storage });
let cpUpload = upload.single('image');
var mulUpload = upload.fields([{ name: 'pic', maxCount: 1 }, { name: 'cover', maxCount: 1 }])

/* Sign Up. */
router.post('/signup', (req, res) => {
    userService.signup(req.body, (data) => {
        res.send(data);
    });
});

/** phone number verified */
router.post('/otp-verify', (req, res) => {
    userService.otpVerify(req.body, (data) => {
        res.send(data);
    });
});

router.post('/resendotp', (req, res) => {
    userService.resendOtp(req.body, (data) => {
        res.send(data);
    });
});

/**complete profile */
router.post('/complete-profile', cpUpload ,(req, res) => {
    userService.completeProfile(req.body,req.file, (data) => {
        res.send(data);
    });
});
/* Login. */
router.post('/login', (req, res) => {
    userService.login(req.body, (data) => {
        res.send(data);
    });
});

/* Login via facebook. */
router.post('/login-with-facebook', (req, res) => {
    userService.loginWithFacebook(req.body, (data) => {
        res.send(data);
        //console.log(req,"post")
    });
});

/* Login via facebook. */
router.post('/login-with-google', (req, res) => {
    userService.loginWithGoogle(req.body, (data) => {
        res.send(data);
    });
});




/* Send Forgot Password OTP. */
router.post('/forgot-password', (req, res) => {
    userService.forgotPassword(req.body, (data) => {
        res.send(data);
    });
});


/*  */
router.get('/email-verify', (req, res) => {
    userService.emailVerify(req.query, (data) => {
        res.send(data);
    });
});


/*Forgot Password OTP. */
router.post('/verify-forgot-password-link', (req, res) => {
    userService.verifyForgotPasswordLink(req.query, (data) => {
        res.send(data);
    });
});

/*Reset Password after OTP. */
router.post('/reset-password', (req, res) => {
    userService.resetPassword(req.body, (data) => {
        res.send(data);
    });
});

router.post('/change-password', (req, res) => {
    userService.changePassword(req.body, (data) => {
        res.send(data);
    });
});

/**Student email verified */
router.post('/email-verified', (req, res) => {
    userService.emailVerified(req.body, (data) => {
        res.send(data);
    });
});

router.get('/verify-email-link', (req, res) => {
    userService.verifyEmailLink(req.query, (data) => {
        console.log(data);
        if (data.statusCode == 200) {
            res.send({statusCode:200,responseMessage:"link verified successfully"})
        }
        else {
            res.send({statusCode:data.statusCode,responseMessage:"unable to verify link"})
        }
    });

});
/** group Api's  */
router.post('/get-profile', (req, res) => {
    userService.getProfile(req.body, (data) => {
        res.send(data);
    });
});

router.post('/update-group', authHandler, (req, res) => {
    userService.getProfile(req.body, (data) => {
        res.send(data);
    });
});

router.post('/join-group',  (req, res) => {
    userService.joinGroup(req.body, (data) => {
        res.send(data);
    });
});

router.post('/group-detail',  (req, res) => {
    userService.groupDetail(req.body, (data) => {
        res.send(data);
    });
});

router.post('/search-group', (req, res) => {
    userService.searchGroup(req.body, (data) => {
        res.send(data);
    });
});

router.post('/join-event', (req, res) => {
    userService.joinEvent(req.body, (data) => {
        res.send(data);
    });
});

router.post('/search-event', (req, res) => {
    userService.searchEvent(req.body, (data) => {
        res.send(data);
    });
});

router.post('/update-profile',cpUpload, (req, res) => {
    userService.updateUser(req.body,req.file, (data) => {
        res.send(data);
    });
});

router.post('/trending-group', (req, res) => {
    userService.trendingGroup(req.body, (data) => {
        res.send(data);
    });
});

router.post('/upcoming-event', (req, res) => {
    userService.upComingEvent(req.body, (data) => {
        res.send(data);
    });
});

router.post('/chat-verified-group', (req, res) => {
    userService.chatAndVerifiedGroup(req.body, (data) => {
        res.send(data);
    });
});

// router.post('/uploadUrl',(req, res) => {
//     userService.uploadUrl(req.body, (data) => {
//         res.send(data);
//     });
// });

// router.post('/reducewarning' ,(req, res) => {
//     userService.reduceWarning(req.body, (data) => {
//         res.send(data);
//     });
// });

router.post('/uploadUrl', botHandler ,(req, res) => {
    userService.uploadUrl(req.body, (data) => {
        res.send(data);
    });
});

router.post('/reducewarning', botHandler2 ,(req, res) => {
    userService.reduceWarning(req.body, (data) => {
        res.send(data);
    });
});

router.post('/showcards', (req, res) => {
    userService.showCards(req.body, (data) => {
        res.send(data);
    });
});

router.post('/homedata', (req, res) => {
    userService.homeData(req.body, (data) => {
        res.send(data);
    });
});
/** Instagrams analytics api's */
router.post('/instaUserAnalytics', (req, res) => {
    userService.instaUserAnalytics(req.body, (data) => {
        res.send(data);
    });
});

router.post('/allhashtags', (req, res) => {
    userService.allHashTag(req.body, (data) => {
        res.send(data);
    });
});

router.post('/searchtagsbycategory', (req, res ) => {
    userService.hashTagCategory(req.body, (data) => {
        res.send(data)
    });
});

router.post('/searchhashtags', (req, res ) => {
    userService.hashTagSearch(req.body, (data) => {
        res.send(data)
    });
});

router.post('/getUserAnalytics', (req, res) => {
    userService.getUserAnalytics(req.body, (data) => {
        res.send(data);
    });
});

router.post('/getTipsAndTricks', (req, res) => {
    userService.getTipsAndTricks(req.body, (data) => {
        res.send(data);
    });
});

router.post('/contactus', (req, res) => {
    userService.contactUs(req.body, (data) => {
        res.send(data);
    });
});

router.post('/uploadurlevent', (req, res) => {
    userService.uploadUrlInEvents(req.body, (data) => {
        res.send(data);
    });
});
router.post('/getRewardsDetail', (req, res) => {
    userService.getRewardsDetail(req.body, (data) => {
        res.send(data);
    });
});

router.post('/claimPoints', (req, res) => {
    userService.claimPoints(req.body, (data) => {
        res.send(data);
    });
});

router.post('/verifiedgroups', (req, res) => {
    userService.onlyVerifiedGroups(req.body, (data) => {
        res.send(data);
    });
});

module.exports = router;