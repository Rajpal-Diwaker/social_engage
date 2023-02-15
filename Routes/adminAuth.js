let express = require('express'),
    router = express.Router(),
    util = require('../Utilities/util'),
    fileExtension = require('file-extension'),
    multer = require('multer'),
    crypto = require('crypto'),
    adminService = require('../Services/adminService'),
    authHandler = require('../authHandler/auth').basicAuthUser;

    var multipart = require('connect-multiparty');
    var multipartMiddleware = multipart();


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

router.post('/login', (req, res) => {
    adminService.login(req.body, (data) => {
        res.send(data);
    });
});

router.post('/forgotpassword', (req, res) => {
    adminService.forgotPassword(req.body, (data) => {
        res.send(data);
    });
});

router.get('/verifyforgotpasswordlink', (req, res) => {
    adminService.verifyForgotPasswordLink(req.query, (data) => {
        console.log(">>>>>>>>>>>>>>>>>>>>>>",typeof data)
        if(data.statusCode === 200){
            console.log("KKKKKKKKKKKKKKKKKKKKKKKKKK",data.statusMessage)
            res.redirect('http://localhost:3000/resetpassword')
        }
        else{
            res.send({message : data.statusMessage})
        }
    });
});

router.post('/resetpassword', (req, res) => {
    adminService.resetPassword(req.body, (data) => {
        res.send(data);
    });
});

router.post('/changepassword', (req, res) => {
    adminService.changePassword(req.body, (data) => {
        res.send(data);
    });
});

router.post('/getprofile', (req, res) => {
    adminService.getProfile(req.body, (data) => {
        res.send(data);
    });
});

router.post('/creategroup',cpUpload,(req, res) => {
    // console.log("QQQQQQQQQQQQQQQQQQAAAAAAAAAAAAAAAAAAA",req.body,req.files)
    adminService.addGroup(req.body,req.file, (data) => {
        res.send(data);
    });
});

router.post('/updateGroup', cpUpload,(req, res) => {
    adminService.updateGroup(req.body,req.file, (data) => {
        res.send(data);
    });
});

router.post('/controlsEdit', cpUpload, (req, res) => {
    console.log("$$$$$$$$$$$$$$$$$$$$$$$$",req.file,"ccccccccccccccccc",req.body)
    adminService.adminControls(req.body,req.file, (data) => {
        res.send(data);
    });
});

router.post('/createevent',cpUpload, (req, res) => {
    adminService.addEvent(req.body,req.file, (data) => {
        res.send(data);
    });
});

router.post('/updateEvent',cpUpload, (req, res) => {
    adminService.updateEvent(req.body, req.file,(data) => {
        // console.log("OOOOOOOOOOOOOOOO",req.file)
        res.send(data);
    });
});

router.post('/getEvents', (req, res) => {
    adminService.getEvents(req.body,(data) => {
        // console.log("OOOOOOOOOOOOOOOO",req.file)
        res.send(data);
    });
});

router.post('/dashboard',(req, res) => {
    adminService.dashboard(req.body, (data) => {
        res.send(data);
    });
});

router.post('/howtouse',cpUpload,(req, res) => {
    adminService.howToUse(req.body,req.file, (data) => {
        res.send(data);
    });
});

router.post('/createTipsAndTricks',cpUpload,(req, res) => {
    adminService.tipsTricks(req.body,req.file, (data) => {
        res.send(data);
    });
});

router.post('/getAllUsers',(req, res) => {
    adminService.getAllUsers(req.body, (data) => {
        res.send(data);
    });
});
router.post('/addrules',(req, res) => {
    adminService.addRules(req.body, (data) => {
        res.send(data);
    });
});
router.post('/updaterules',(req, res) => {
    adminService.updateRules(req.body, (data) => {
        res.send(data);
    });
});

router.post('/getAllGroups',(req, res) => {
    adminService.getAllGroups(req.body, (data) => {
        res.send(data);
    });
});

router.post('/updateUser',(req, res) => {
    adminService.updateUser(req.body, (data) => {
        res.send(data);
    });
});

router.post('/getTipsTricks',(req, res) => {
    adminService.getTipsTricks(req.body, (data) => {
        res.send(data);
    });
});
router.post('/updateTipsTricks',cpUpload,(req, res) => {
    adminService.updateTipsTricks(req.body,req.file, (data) => {
        res.send(data);
    });
});
router.post('/gethowToUse',(req, res) => {
    adminService.gethowToUse(req.body, (data) => {
        res.send(data);
    });
});
router.post('/updateHowToUse',cpUpload,(req, res) => {
    adminService.updateHowToUse(req.body,req.file, (data) => {
        res.send(data);
    });
});

// router.post('/createrewards',(req, res) => {
//     adminService.createRewards(req.body, (data) => {
//         res.send(data);
//     });
// });

router.post('/updaterewards',multipartMiddleware,(req, res) => {
    adminService.updateRewards(req.body, (data) => {
        res.send(data);
    });
});

router.post('/getrewards',(req, res) => {
    adminService.getRewards(req.body,(data) => {
        res.send(data);
    });
});

router.post('/createrewardscard',cpUpload,(req, res) => {
    adminService.createRewardsCard(req.body,req.file, (data) => {
        res.send(data);
    });
});

router.post('/getrewardcards',(req, res) => {
    adminService.getRewardsCard(req.body,(data) => {
        res.send(data);
    });
});
router.post('/editrewardcards',cpUpload,(req, res) => {
    adminService.updateRewardsCard(req.body,req.file, (data) => {
        res.send(data);
    });
});

module.exports = router