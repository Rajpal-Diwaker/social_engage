var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate')
var Schema = mongoose.Schema;
let util = require('../Utilities/util')

let User = new Schema({
    userId: {
        type: mongoose.Schema.ObjectId
    },
    userName: {
        type: String,
        trim: true,
        default: ""
    },
    fullName: {
        type: String,
        trim: true,
        default: ""
    },
    email: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    password: {
        type: String,
        trim: true,
        //select: false,
    },
    dateOfBirth: {
        type: String,
        trim: true
    },
    gender: {
        type: String,
        enum: ["MALE", "FEMALE", "OTHERS"]
    },
    otp: {
        type: Number,
        default: 0
    },
    verified: {
        type: Boolean,
        default: false
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    otpExpireTime: {
        type: Number
    },
    emailExpireTime: {
        type: Number
    },
    countryCode: {
        type: String,
        trim: true
    },
    mergedContact: {
        type: String
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    image: {
        type: String,
        trim: true,
        default: ""
    },
    instagramUser: {
        type: String,
        default: ""
    },
    facebookId: {
        type: String,
        trim: true,
        default: ""
    },
    googleId: {
        type: String,
        trim: true,
        default: ""
    },
    deviceType: {
        type: String,
        trim: true
    },
    completeProfile: {
        type: Boolean,
        default: false
    },
    userType: {
        type: String,
        enum: ["ADMIN", "USER"]
    },
    location: {
        type: Object
    },
    rewardPoint:{
        type:Number
    },
    facebookLoginStatus:{
        type:Number,
        default:0
    },
    googleLoginStatus:{
        type:Number,
        default:0
    },
    normalLoginStatus:{
        type:Number,
        default:0
    },
    subscribed:{
        type:Number,
        default:0
    },
    subscriptionPlan:{
        type:String
    },
    banned:{
        type:Boolean,
        default:false
    },
    status: {
        type: String,
        enum: ["ACTIVE", "BLOCK", "DELETE"],
        default: 'ACTIVE'
    },
    socketId:{
        type:String,
        default:''
    },
    deviceToken:{
        type:String
    },
    referralCode:{
        type:String
    },
    bonusReferralCode:{
        type:String
    },
    claimedId:{
        type:Array
    }
},
    { timestamps: true });

User.plugin(mongoosePaginate);
module.exports = mongoose.model('Users', User);

(function init() {
    mongoose.model('Users', User).findOne({ userType: "ADMIN", status: "ACTIVE" }, (err, adminData) => {
        if (err) {
            console.log("Error in finding admin", err)
        } else if (!adminData) {
            let obj = {
                "email": "prakash.techugo@gmail.com",
                "phone": "7303423430",
                "countryCode": "+91",
                "mergedContact":"+917303423430",
                "fullName": "Prakash singh",
                "password": util.encryptData("Techugo@123"),
                "gender": "MALE",
                "emailVerified": true,
                "verified": true,
                "isVerified": true,
                "dateOfBirth": "15/09/1993",
                "userType": "ADMIN"
            }
            mongoose.model('Users', User).create(obj, (err1, addAdmin) => {
                if (err1) {
                    console.log("Error in creating admin")
                } else {
                    console.log("Admin created successfully", addAdmin)
                }
            })
        } else {
            console.log("Admin already exist")
        }
    })
})();