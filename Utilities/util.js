let nodemailer = require("nodemailer"),
    config = require("./config").config,
    templates = require("./templates"),
    MD5 = require('md5'),
    request = require('request'),
    rp = require('request-promise'),
    mustache = require('mustache'),
    accountSid = config.TWILIO_SID.url,
    authToken = config.TWILIO_AUTH.url,
    client = require('twilio')(accountSid, authToken),
    async = require('async'),
    cron = require('node-cron')


var Instagram = require('instagram-nodejs-without-api');
Instagram = new Instagram();

const {
    getMediaByCode,
    getUserByUsername,
    getMediaByLocation,
    getMediaByTag,
    getMediaLikesByCode,
    getMediaCommentsByCode,
    generalSearch,
    getUserIdFromUsername,
    getUserProfilePicture,
    getTaggedUsersByCode,
    getMediaOwnerByCode
  } = require('instapro');


let htmlEnDeCode = (function () {
    var charToEntityRegex,
        entityToCharRegex,
        charToEntity,
        entityToChar;

    function resetCharacterEntities() {
        charToEntity = {};
        entityToChar = {};
        // add the default set
        addCharacterEntities({
            '&amp;': '&',
            '&gt;': '>',
            '&lt;': '<',
            '&quot;': '"',
            '&#39;': "'"
        });
    }

    function addCharacterEntities(newEntities) {
        var charKeys = [],
            entityKeys = [],
            key, echar;
        for (key in newEntities) {
            echar = newEntities[key];
            entityToChar[key] = echar;
            charToEntity[echar] = key;
            charKeys.push(echar);
            entityKeys.push(key);
        }
        charToEntityRegex = new RegExp('(' + charKeys.join('|') + ')', 'g');
        entityToCharRegex = new RegExp('(' + entityKeys.join('|') + '|&#[0-9]{1,5};' + ')', 'g');
    }

    function htmlEncode(value) {
        var htmlEncodeReplaceFn = function (match, capture) {
            return charToEntity[capture];
        };

        return (!value) ? value : String(value).replace(charToEntityRegex, htmlEncodeReplaceFn);
    }

    function htmlDecode(value) {
        var htmlDecodeReplaceFn = function (match, capture) {
            return (capture in entityToChar) ? entityToChar[capture] : String.fromCharCode(parseInt(capture.substr(2), 10));
        };

        return (!value) ? value : String(value).replace(entityToCharRegex, htmlDecodeReplaceFn);
    }

    resetCharacterEntities();

    return {
        htmlEncode: htmlEncode,
        htmlDecode: htmlDecode
    };
})();

// Define Error Codes
let statusCode = {
    ZERO: 0,
    ONE: 1,
    TWO: 2,
    THREE: 3,
    FOUR: 4,
    FIVE: 5,
    SIX: 6,
    SEVEEN: 7,
    EIGHT: 8,
    NINE: 9,
    OK: 200,
    CREATED: 201,
    TWO_KNOT_TWO: 202,
    TWO_KNOT_THREE: 203,
    FOUR_ZERO_FOUR: 404,
    FOUR_ZERO_THREE: 403,
    FOUR_ZERO_ONE: 401,
    FIVE_ZERO_ZERO: 500
};

// Define Error Messages
let statusMessage = {
    USER_ALREADY_EXIST: "User already exist",
    ACTION_PENDING: "Actions pending",
    USER_BLOCKED: 'USer is blocked for sometime',
    REGISTRATION_DONE: 'Registration done successfully.',
    INCORRECT_PASSWORD: 'Please enter correct password.',
    DOC_UPDATED: 'Document update successfully',
    INVALID_ID: 'Invalid student id',
    INVALID_TUTOR_ID: 'Invalid tutor id',
    INVALID_TUTOR: 'Invalid tutor, Please try later.',
    STATUS_UPDATED: 'Status updated successfully!.',
    LIST_FETCHED: 'List fetched successfully.',
    DATA_FETCHED: 'Data fetched successfully.',
    PAGE_NOT_FOUND: 'Page not found', //404
    SOMETHING_WENT_WRONG: 'Something went wrong.',
    URL_NOT_FOUND: "Url not found",
    DATA_UPDATED: 'Data updated successfully.',
    PARAMS_MISSING: 'Parameters are missing!',
    SERVER_BUSY: 'Our Servers are busy. Please try again later.',
    EMAIL_ALREADY_REGISTERED: 'Email already registered, Try another.',
    PHONE_ALREADY_REGISTERED: 'Phone already registered, Try another.',
    PHONE_NOT_REGISTERED: 'Phone number is not registered, Try another',
    OTP_VERIFY: 'A verification code has been sent to your registered number.Please verify it',
    LINK_EXPIRED: 'Above link has expired. Please try again.',
    INVALID_LINK: 'Link is invalid, Please try again.',
    USER_REGISTERED_SUCCESSFULLY: 'You have registered successfully. Please login to continue',
    PLEASE_SIGNUP_FIRST: 'Your email is not Registered, Please Sign up First.',
    LOGGED_IN: 'You have sucessfully Logged in',
    ENTER_VALID_CUSTOMERID_PASS: 'Please enter your valid email and password.',
    EMAIL_NOT_EXIST: 'Your Email address is not registered, please Sign up to continue.',
    OTP_VERIFY_SUCCESS: 'Phone verified successfully',
    PLEASE_ENTER_VALID_EMAIL: 'Please enter valid email ',
    SOCIAL_ACCOUNT: 'forget password is not requested because its social login',
    OTP_VERIFY_EMAIL: 'Activation message has sent to your registered email, please go through the OTP sent.',
    INVALID_OTP: 'OTP is invalid, Please try again.',
    OTP_EXPIRED: 'Above otp has expired. Please try again.',
    VERIFY_EMAIL: 'Email verification has sent to your registered email, please go through the link sent.',
    EMAIL_VERIFIED: 'Congratulations! Your email has verified successfully!',
    EMAIL_ALREADY_VERIFIED: 'Email has  been already verified!.',
    PASSWORD_CHANGED: 'Your Password has changed successfully.Login to your account',
    PASSWORD_NOT_MATCHED: "Password and confirm password not matched",
    NO_DATA: '0 record found',
    NOT_VERIFIED_INSTA: "Not a verified instagram user",
    EMAIL_NOT_EXISTS: 'Please enter a registered phone number or email',
    PROFILE_UPDATED: 'Profile updated successfully!',
    TOKEN_EXPIRED: 'Invalid token or expired token',
    NOT_VERIFIED: 'Please verify your account first',
    PHONE_NOT_VERIFIED: "Phone number not verified",
    EMAIL_NOT_VERIFIED: "Email number not verified",
    GROUP_CREATED: "Group created successfully",
    GROUP_UPDATED: "Group updated successfully",
    USER_EXIST: "User already exist",
    USER_NOTINGROUP: "User not in group",
    NO_URLS: "You are the first user to upload your URL",
    NO_WARNINGS: "You dont have any warnings",
    GROUP_FOUND: "Groups found successfully",
    STATIC_FOUND: "Static content found successfully",
    STATIC_UPDTAED: "Static content updated successfully",
    CONTROLS_UPDATED: "Controls updated successfully",
    EVENT_CREATED: "Event created successfully",
    EVENT_UPDATED: "Event updated successfully",
    EVENT_NOT_START: "Event has not been started yet",
    EVENT_FOUND: "Event found successfully",
    EVENT_EXPIRE: "Event joining time has been expired",
    EMAIL_NOT_VERIFIED: "Email id not verified",
    UPDATE_FAILED: "Unable to update",
    USERNAME_EXIST: "Username already exist",
    PROFILE_INCOMPLETE: "Complete your profile first",
    DATA_LOADING: "LOADING...",
    LIKE_WARNING: "Warning!you have not liked all the post which you got",
    COMMENT_WARNING: "Warning!you have not commented on all the post which you got",
    LIKEANDCOMMENT_WARNING: "Warning!you have not liked and commented on all the post which you got",
    BANNED: "You are banned from uploading your post",
    WAIT: "Wait for sometime!As you visited just now",
    CARD_PENDING_2LIKE: "Post are still pending to like",
    CARD_PENDING_2COMMENT: "Post are still pending to comment",
    CARD_PENDING_2LIKEANDCOMMENT: "Post are still pending to like and comment",
    CREATED_DOC:"Document created successfully",
    OUT_OF_TIME:"You are out of time fro reducing warning",
    INSTAUSEREXIST:"Instagram username already exist"
};

let mailModule = nodemailer.createTransport(config.OTP_EMAIL_CONFIG);


let encryptData = (stringToCrypt) => {
    return MD5(stringToCrypt);
};

let randomNumber = function () {
    const random = parseInt(Math.floor(100000 + Math.random() * 900000))
    return random;
}

let smsSender = (numberGiven, otp) => {

    client.messages
    client.messages
        .create({
            from: '+12563804939',
            body: ` verification otp: ${otp}`,
            to: numberGiven
        }, (error, result) => {
            if (error) {
                console.log("this is error in sending otp to phone number", error);
                // callback(error, null)
            } else {
                console.log('phone otp sent: ');
                // callback(null, result)

            }
        })


}

let sendNormalMail = (email, subject, html) => {
    var mailOptions = {
        from: config.OTP_EMAIL_CONFIG.auth.user,
        to: email,
        subject: subject,
        html: html
    };
    mailModule.sendMail(mailOptions, (err, success) => {
        if (err) {
            console.log(err, 'error sending mail')
        } else {
            console.log("activation messege ", success)
        }
    });
}

let sendActivationMail = (data) => {
    var mailOptions = {
        from: templates.activationMailTemplate.from,
        to: data.email,
        subject: templates.activationMailTemplate.subject,
        html: mustache.render(templates.activationMailTemplate.html, data)
    };
    mailModule.sendMail(mailOptions, (err, success) => {
        if (err) {
            console.log(err, 'error sending mail')
        } else {
            console.log("activation messege ", success)
        }
    });
}

let sendForgotPasswordMail = (data) => {
    var mailOptions = {
        from: templates.forgotPasswordMailTemplate.from,
        to: data.email,
        subject: templates.forgotPasswordMailTemplate.subject,
        html: mustache.render(templates.forgotPasswordMailTemplate.html, data)
    };
    mailModule.sendMail(mailOptions, (err, result) => {
        if (err) {
            console.log("mail unable to sent ", err)
        } else {
            console.log("KKKKKKKKKKKKKKKKKKKK", result)
        }
    });
}

let sendEmailVerificationMail = (data) => {
    var mailOptions = {
        from: templates.emailVerifiedMailTemplate.from,
        to: data.email,
        subject: templates.emailVerifiedMailTemplate.subject,
        html: mustache.render(templates.emailVerifiedMailTemplate.html, data)
    };
    mailModule.sendMail(mailOptions, (err, result) => {
        if (err) {
            console.log("error in sending mail", err)
        } else {
            console.log("mail send successfully", result)
        }
    });
}


let calculateDistance = (data) => {
    let R = 6371; // Earth's radius in Km
    return Math.acos(Math.sin(data.lat1) * Math.sin(data.lat2) +
        Math.cos(data.lat1) * Math.cos(data.lat2) *
        Math.cos(data.lng2 - data.lng1)) * R;
    cb(dist);
}

function getAge(DOB) {
    var today = new Date();
    var birthDate = new Date(DOB);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age = age - 1;
    }
    return age;
}

function randomString(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }

function getInstaData(token, username, callback) {
    request(`https://graph.facebook.com/v4.0/me/accounts?access_token=${token}`, function (error, response, body) {
        if (error) {
            console.log('error:', error);
            callback(error, null)
        }
        const data1 = JSON.parse(body)
        const id = data1.data[0].id
        request(`https://graph.facebook.com/v4.0/${id}?fields=instagram_business_account&access_token=${token}`, function (error, response, body) {
            if (error) {
                console.log('error:', error);
                callback(error, null)
            }
            const data2 = JSON.parse(body)
            const ig_id = data2.instagram_business_account.id;

            request(`https://graph.facebook.com/v4.0/${ig_id}?fields=business_discovery.username(${username}){followers_count,media_count,media{comments_count,like_count}}&access_token=${token}`, function (error, response, body) {
                if (error) {
                    console.log('error:', error);
                    callback(error, null)
                }
                let i = 0,
                    finalData = {}
                const data3 = JSON.parse(body)
                let data3length = data3.business_discovery.media.data.length
                let totalLikes = 0;
                for (i; i < data3length; i++) {
                    totalLikes = totalLikes + data3.business_discovery.media.data[i].like_count
                }
                finalData = {
                    followers_count: data3.business_discovery.followers_count,
                    media_count: data3.business_discovery.media_count,
                    id: data3.business_discovery.id,
                    total_likes: totalLikes,
                    media: data3.business_discovery.media.data
                }
                console.log("final instagram data", finalData)
                callback(null, finalData)
            })
        })
    });
}
// getInstaData('EAAVLcuLZAXo0BADZBD3xkki3wD2BK7I40uQ5dfBRD0zQiCWNM4WkzRE5tRWCciOyuLI9mubPgHKZCZA4U42cFkNAzf11ZBccH4SQGMgQWOmDq5pKcBqbFRGCjSuDODLyOcvTD0uAKunIPJZBdlZBmgeSTluQiEME72wS43L16424AbDqPCtXSbZAfa8wc64knCtBNZBGFaaOPrwZDZD','techshades',(err,result)=>{
//     console.log(result)
// })

// "https://graph.facebook.com/v3.2/ig_hashtag_search?user_id=17841405309211844&q=bluebottle&access_token={access-token}"


function hastagSuggested(keyWord1) {
    return new Promise((resolve, reject) => {

        let URl1 = `https://www.instagram.com/explore/tags/${keyWord1}/?__a=1`
        rp(URl1, (err, res, body) => {
            // let data = JSON.parse(body)
            if (err) {
                resolve([])
            }
            // console.log("TTTTTTTTTTTTTT",body)

            let hashtags = scrapeHashtags(body);
            hashtags = removeDuplicates(hashtags);
            hashtags = hashtags.map(ele => "#" + ele)
            // console.log("kkkkkkkkkkkkkkkkkkkk",hashtags)
            var search = "#" + keyWord1;
            var arr = [];
            var i = 0,
                j = 0;
            // console.log("2617>>>>>>>>>>>", hashtags.length);

            for (i = 0; i < hashtags.length; i++) {
                var check = hashtags[i].slice(
                    0,
                    search.length
                );
                if (check == search) {
                    console.log("j = ", j);
                    arr.push(hashtags[i]);
                    // console.log("2425>>>>>>>>>>>>>>", arr);
                    j++;
                }
            }
            console.log("2429>>>>>>>>array length", arr.length);
            // for (i = 0; i < arr.length; i++) {
            //     console.log("2431>>>>>>>>>>>>>>array detail ", arr[i]);
            // }
            resolve(hashtags);
        })
        // console.log("KHGFDGHJDDLKSDGHDJSSKDHJS",data)
        //  }).catch((err) => {

        //     console.log(err);
        //     resolve(err)
        //  });
    })
}
const scrapeHashtags = (html) => {

    var regex = /(?:^|\s)(?:#)([a-zA-Z\d]+)/gm;
    var matches = [];
    var match;
    while ((match = regex.exec(html))) {
        matches.push(match[1]);
    }
    return matches;
}



const removeDuplicates = (arr) => {
    let newArr = [];
    arr.map(ele => {
        if (newArr.indexOf(ele) == -1) {
            newArr.push(ele)
        }
    })
    return newArr;
}

function validUrl(url) {
    return new Promise((resolve, reject) => {
        let URl = `${url}?__a=1`
        rp(URl).then(async (html) => {
            let data = JSON.parse(html);
            data = data.graphql.shortcode_media
            console.log("AAAAAAAAAAAAAAAAa", data)
            let obj = {}
            obj.imageUrl = data.display_url
            if (data.edge_media_to_caption.edges.length > 0) {
                obj.caption = data.edge_media_to_caption.edges[0].node.text
            }
            obj.time = data.taken_at_timestamp
            resolve(obj)
        }).catch(error => {
            resolve([])
        })
    })
}

function hashTagSearch(keyword) {
    return new Promise((resolve, reject) => {
        let URl = `https://www.instagram.com/explore/tags/${keyword}/?__a=1`
        rp(URl).then(async (html) => {
            let data = JSON.parse(html);
            data = data.graphql.hashtag
            // console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", data)
            let obj = {
            };
            obj.name = "#" + data.name;
            obj.popularity = data.edge_hashtag_to_media.count
            // console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>",data)
            let hashArray = await hastagSuggested(keyword);
            hashArray = await bouncer(hashArray);
            console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", hashArray)
            // console.log("QWEEFBNWSXDCVBRFGN", hashArray);

            obj.hashtagSuggestion = [];
            //  for (let i = 0; i<hashArray.length;i++){
            // let middle = hashArray.length / 2;
            let first30 = hashArray.slice(1, 30);
            // let middle50 = hashArray.slice(middle - 25, middle + 25);
            // let last50 = hashArray.slice(hashArray.length - 50, hashArray.length);
            // let firstRandom10 =[];
            // let secondRandom10 =[];
            // let thirdRandom10 =[];
            // let i=0;
            // let unique = [];
            // let counter = 0;
            // for (i;i<first50.length;i++){
            //  let randfunction = generateRandomIndex();
            //  for (let j=0;j<unique.length;j++){
            //      if(unique[j]==randfunction){
            //          return;
            //      }
            //  }
            //  if(firstRandom10.length != 10 ){
            //         if(first50[randfunction]){
            //             firstRandom10.push(first50[randfunction])
            //         }
            // if(middle50[randfunction]){
            //     secondRandom10.push(middle50[randfunction])
            // }
            // if(last50[randfunction]){
            //     thirdRandom10.push(last50[randfunction])
            // }
            //  }
            // }
            // firstRandom10 = firstRandom10.concat(secondRandom10, thirdRandom10)

            obj.hashtagSuggestion = obj.hashtagSuggestion.concat(first30)
            //  }
            // console.log("><><><><><><>>>>>>>><<<<<<<<<<<<<<<<<>>>>>>>", obj)
            resolve(obj)
        }).catch((err) => {
            console.log(err);
            resolve([])
        });
    })
}

function bouncer(arr) {
    return arr.filter(item => item);
}

function generateRandomIndex() {
    return Math.floor(Math.random() * 50);
}

let data ={
    csrfToken:'',
    sessionId:''
};

function instaBasicProfile(username) {
    return new Promise((resolve, reject) => {
        let url = `https://www.instagram.com/${username}/?__a=1`;
        let option = {
            'uri': `https://www.instagram.com/${username}/?__a=1`,
            'X-CSRFToken' : data.csrfToken,
            'sessionid': data.sessionId,
            "Host":"www.instagram.com",
            'origin':'https://www.instagram.com',
            'Referer':`https://www.instagram.com/${username}/`,
            'User-Agent':'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:70.0) Gecko/20100101 Firefox/70.0'
        }
        rp(option).then(async result => {
            // await sleep(5000);
            console.log("KKKKKKKklfdjfksdfjsdkfsdjfskdfjsd", result)
            let userDetail = JSON.parse(result);
            // if(!)
            userDetail = userDetail.graphql.user;
            let totalLikes = 0;
            let totalComments = 0;
            let popularPost = [];
            // let engagementsCount = 0;
            let counter = 0;
            let media = userDetail.edge_owner_to_timeline_media.edges
            for (let i = 0; i < media.length; i++) {
                totalLikes = totalLikes + media[i].node.edge_liked_by.count;
                totalComments = totalComments + media[i].node.edge_media_to_comment.count;
                counter++;
            }
            let avgLikes = parseInt(totalLikes / counter);
            let avgComment = parseInt(totalComments / counter);
            let engagementsCount;
            let averageEngagements;
            if (avgComment && avgLikes) {
                engagementsCount = (avgComment + avgLikes * 100) / userDetail.edge_followed_by.count;
                averageEngagements = engagementsCount / counter;
            }
            if (engagementsCount) {
                engagementsCount = engagementsCount.toFixed(2)
            }
            if (averageEngagements) {
                averageEngagements = averageEngagements.toFixed(2)
            }
            if (!engagementsCount) {
                engagementsCount = 0;
            }
            if (!averageEngagements) {
                averageEngagements = 0;
            }
            if (!avgLikes) {
                avgLikes = 0;
            }
            if (!avgComment) {
                avgComment = 0;
            }
            console.log("MMMMMMMMMMMMMMMMMM", media, avgLikes, avgComment, engagementsCount, counter)
            let popular = media.sort(function (a, b) {
                return a.node.edge_liked_by.count - b.node.edge_liked_by.count
            })
            popularPost = popularPost.concat(popular)
            popularPost = popularPost.reverse();
            let newPopular = []
            for (let i = 0; i < popularPost.length; i++) {
                let obj = {}
                obj.display_url = popularPost[i].node.display_url;
                obj.thumbnail = popularPost[i].node.thumbnail_src;
                newPopular.push(obj)
            }
            let newRecent = []
            for (let j = 0; j < popularPost.length; j++) {
                let obj = {}
                obj.display_url = media[j].node.display_url;
                obj.thumbnail = media[j].node.thumbnail_src;
                newRecent.push(obj)
            }
            let obj = {};
            obj.username = userDetail.username;
            obj.profilePic = userDetail.profile_pic_url_hd;
            obj.biography = userDetail.biography
            obj.followers = userDetail.edge_followed_by.count;
            obj.following = userDetail.edge_follow.count;
            obj.fullName = userDetail.full_name;
            obj.totalPost = userDetail.edge_owner_to_timeline_media.count;
            obj.totalLikes = totalLikes;
            obj.totalComments = totalComments;
            obj.instagramId = userDetail.id;
            obj.recent = newRecent;
            obj.topPost = newPopular.slice(0, 10);
            obj.engagements = engagementsCount.toString() + '%';
            obj.isVerified = userDetail.is_verified;
            obj.businessAccount = userDetail.is_business_account;
            obj.details = true;
            obj.averageLikes = avgLikes;
            obj.averageComments = avgComment;
            obj.averageEngagements = averageEngagements.toString() + '%';


            resolve(obj)
        }).catch(error => {
            console.log("safgsgwertsesefsfsfdsef", error)
            let obj = {}
            obj.username = username
            obj.profilePic = ''
            obj.biography = ''
            obj.followers = 0
            obj.following = 0
            obj.fullName = ''
            obj.totalPost = 0
            obj.totalLikes = 0
            obj.totalComments = 0
            obj.recent = []
            obj.topPost = []
            obj.engagements = '0%'
            obj.isVerified = false;
            obj.businessAccount = false;
            obj.details = false;
            obj.averageLikes = 0;
            obj.averageComments = 0;
            obj.averageEngagements = '0%';
            resolve(obj)
        })
    })
}





let ab=()=>{
    Instagram.getCsrfToken().then((csrf) =>
    {
        Instagram.csrfToken = csrf;
        console.log("OTTTTTTTTTTPFFFFFFFFFFFFFFFFFTOOOOOOOOOOOOOOOOOOO",csrf)
        data.csrfToken=csrf
    }).then(() =>
    {
      return Instagram.auth('prakashsingh7876', '8953672767').then(sessionId =>
      {

        Instagram.sessionId = sessionId;
        if(sessionId){
            data.sessionId = sessionId;
        }
        
      })
    }).catch(console.error);

}
[0].forEach(async x=>{
    ab();
     await sleep(3000);
     console.log("VVVVVVVVVVVVVVVVVVVV",data)
})









// curl -i -X GET "https://graph.facebook.com/v5.0/me/accounts?access_token=EAAi4hwadN10BAFNCj3AFODgvOn4eI5zYXKcxlKaHApMKKUMcrYE1yCZCG29UwtZAdkq70EQjaJY4fTcvByR4pLMNYhsXbAUv9UhtMNUKQpLBhUEZB6eluZBK5oPK0yGgMyZCoxvB6W9LAQShB5X5Tbcl410wESD3nk3nCXvw1ThKF6kJ2vVKGZAVVTfI9yAfsswl1Wz6Lec2ZBJ4e4JxN9rcCTgQfyK3rDEezGn0dy0NgZDZD"


// curl -i -X GET  "https://graph.facebook.com/v5.0/131907424172093?fields=instagram_business_account&access_token=EAAi4hwadN10BAFNCj3AFODgvOn4eI5zYXKcxlKaHApMKKUMcrYE1yCZCG29UwtZAdkq70EQjaJY4fTcvByR4pLMNYhsXbAUv9UhtMNUKQpLBhUEZB6eluZBK5oPK0yGgMyZCoxvB6W9LAQShB5X5Tbcl410wESD3nk3nCXvw1ThKF6kJ2vVKGZAVVTfI9yAfsswl1Wz6Lec2ZBJ4e4JxN9rcCTgQfyK3rDEezGn0dy0NgZDZD"



// 17841406947135098

// curl -i -X GET  "https://graph.facebook.com/v5.0/17841406947135098/media?access_token=EAAi4hwadN10BAFNCj3AFODgvOn4eI5zYXKcxlKaHApMKKUMcrYE1yCZCG29UwtZAdkq70EQjaJY4fTcvByR4pLMNYhsXbAUv9UhtMNUKQpLBhUEZB6eluZBK5oPK0yGgMyZCoxvB6W9LAQShB5X5Tbcl410wESD3nk3nCXvw1ThKF6kJ2vVKGZAVVTfI9yAfsswl1Wz6Lec2ZBJ4e4JxN9rcCTgQfyK3rDEezGn0dy0NgZDZD"




// GET "https://graph.facebook.com/17841405822304914/insights?metric=impressions,reach,profile_views&period=day"

function usersInsight(token) {
    return new Promise((resolve, reject) => {
        let insigths = {
            day: [],
            week: [],
            day_28: [],
            lifetime: [],
            story:[]
        }
        request(`https://graph.facebook.com/v4.0/me/accounts?access_token=${token}`, function (error, response, body) {
            if (error) {
                reject(error);
            }
            const data1 = JSON.parse(body)
            if (data1.data.length == 0) {
                resolve([])
                return;
            }
            const id = data1.data[0].id
            request(`https://graph.facebook.com/v4.0/${id}?fields=instagram_business_account&access_token=${token}`, function (error, response, body) {
                if (error) {
                    reject(error);
                }
                const data2 = JSON.parse(body)
                const ig_id = data2.instagram_business_account.id;
                request(`https://graph.facebook.com/v4.0/${ig_id}/insights??metric=impressions,reach,profile_views,email_contacts,get_directions_clicks,website_clicks&period=day&access_token=${token}`, function (error, response, body) {
                    const data3 = JSON.parse(body);
                    insigths.day.push(data3);
                    request(`https://graph.facebook.com/v4.0/${ig_id}/insights??metric=impressions,reach,profile_views&period=week&access_token=${token}`, function (error, response, body) {
                        const data4 = JSON.parse(body);
                        insigths.monthly.push(data4);
                        request(`https://graph.facebook.com/v4.0/${ig_id}/insights??metric=impressions,reach,profile_views&period=day_28&access_token=${token}`, function (error, response, body) {
                            const data5 = JSON.parse(body);
                            insigths.yearly.push(data5);
                            request(`https://graph.facebook.com/v4.0/${ig_id}/insights??metric=audience_city,audience_country,audience_gender_age,audience_locale,online_followers&period=lifetime&access_token=${token}`, function (error, response, body) {
                                const data6 = JSON.parse(body);
                                insigths.lifetime.push(data6);
                                request(`https://graph.facebook.com/v4.0/${ig_id}/stories&access_token=${token}`, function (error, response, body) {
                                const data7 = JSON.parse(body);
                                insigths.story.push(data7);
                                resolve(insigths);
                            })
                            })
                        })
                    })
                })
            })
        })
    })
}

function usersInsight(token, startTime, endTime) {
    return new Promise((resolve, reject) => {
        let insigths = {
            day: [],
            week: [],
            day_28: [],
            lifetime: [],
            story:[]
        }
        request(`https://graph.facebook.com/v4.0/me/accounts?access_token=${token}`, function (error, response, body) {
            if (error) {
                reject(error);
            }
            const data1 = JSON.parse(body)
            if (data1.data.length == 0) {
                resolve([])
                return;
            }
            const id = data1.data[0].id
            request(`https://graph.facebook.com/v4.0/${id}?fields=instagram_business_account&access_token=${token}`, function (error, response, body) {
                if (error) {
                    reject(error);
                }
                const data2 = JSON.parse(body)
                const ig_id = data2.instagram_business_account.id;
                request(`https://graph.facebook.com/v4.0/${ig_id}/insights??metric=impressions,reach,profile_views,email_contacts,get_directions_clicks,website_clicks&period=day&since=${startTime}&until=${endTime}&access_token=${token}`, function (error, response, body) {
                    const data3 = JSON.parse(body);
                    insigths.day.push(data3);
                    request(`https://graph.facebook.com/v4.0/${ig_id}/insights??metric=impressions,reach,profile_views&period=week&since=${startTime}&until=${endTime}&access_token=${token}`, function (error, response, body) {
                        const data4 = JSON.parse(body);
                        insigths.week.push(data4);
                        request(`https://graph.facebook.com/v4.0/${ig_id}/insights??metric=impressions,reach,profile_views&period=day
                        _28&since=${startTime}&until=${endTime}&access_token=${token}`, function (error, response, body) {
                            const data5 = JSON.parse(body);
                            insigths.day_28.push(data5);
                            request(`https://graph.facebook.com/v4.0/${ig_id}/insights??metric=audience_city,audience_country,audience_gender_age,audience_locale,online_followers&period=lifetime&access_token=${token}`, function (error, response, body) {
                                const data6 = JSON.parse(body);
                                insigths.lifetime.push(data6);
                            })
                            request(`https://graph.facebook.com/v4.0/${ig_id}/stories&access_token=${token}`, function (error, response, body) {
                                const data7 = JSON.parse(body);
                                insigths.story.push(data7);
                                resolve(insigths);
                            })
                        })
                    })
                })
            })
        })
    })
}


function userTopMentions(token) {
    return new Promise((resolve, reject) => {

        request(`https://graph.facebook.com/v4.0/me/accounts?access_token=${token}`, function (error, response, body) {
            if (error) {
                resolve([]);
            }
            const data1 = JSON.parse(body)
            if (data1.data.length == 0) {
                resolve([])
                return;
            }
            const id = data1.data[0].id
            request(`https://graph.facebook.com/v4.0/${id}?fields=instagram_business_account&access_token=${token}`, function (error, response, body) {
                if (error) {
                    resolve([]);
                }
                const data2 = JSON.parse(body)
                const ig_id = data2.instagram_business_account.id;
                request(`https://graph.facebook.com/${ig_id}/tags?fields=id,username&access_token=${token}`, function (error, response, body) {
                    if (error) {
                        resolve([]);
                    }
                    const data3 = JSON.parse(body)
                    const mentions = data3.data;
                    resolve(mentions)
                })
            })
        })
    })
}

// average saves
//  Stories Posted (numbers only) Stories Average impressions (numbers only)
// Stories Average reach (numbers only) Average Stories posted per day (numbers only)
// Profile Views, (numbers only)
// Website Clicks, (numbers only)
// Email clicks (numbers only)
// get direction clicks (numbers only)



function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
    statusCode: statusCode,
    statusMessage: statusMessage,
    encryptData: encryptData,
    sendActivationMail: sendActivationMail,
    sendForgotPasswordMail: sendForgotPasswordMail,
    calculateDistance: calculateDistance,
    getAge: getAge,
    sendEmailVerificationMail: sendEmailVerificationMail,
    smsSender: smsSender,
    randomNumber: randomNumber,
    getInstaData: getInstaData,
    sendNormalMail: sendNormalMail,
    hashTagSearch: hashTagSearch,
    instaBasicProfile: instaBasicProfile,
    usersInsight: usersInsight,
    generateRandomIndex: generateRandomIndex,
    validUrl: validUrl,
    userTopMentions: userTopMentions,
    randomString:randomString
}





// 'Accept':'*/*',
// 'Cache-Control':'max-age=0'
// "Connection":"keep-alive"
// 'Content-Type':	'application/x-www-form-urlencoded'
// "Host":"www.instagram.com"
// Origin	
// https://www.instagram.com
// Referer	
// https://www.instagram.com/prakashsingh7876/
// TE	
// Trailers
// User-Agent	
// Mozilla/5.0 (X11; Ubuntu; Linu…) Gecko/20100101 Firefox/70.0
// X-CSRFToken	
// 2FXPPJbdKLGYbIsuFrRTbVKZ04YinFl8
// X-IG-App-ID	
// 936619743392459
// X-IG-WWW-Claim	
// 0
// X-Instagram-AJAX	
// 8f02a43ad311
// X-Requested-With	
// XMLHttpRequest