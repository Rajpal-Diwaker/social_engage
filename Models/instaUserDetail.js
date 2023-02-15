var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate')
var Schema = mongoose.Schema;

let instaUserDetail = new Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'Users'
    },
    instagramUser:{
        type:String
    },
    likes:{
        type:Number
    },
    followers:{
        type:Number
    },
    weeklyLikesGained:[{
        gainedLikes:{
            type:Number,
            default:0
        },
        gainedFollowers:{
            type:Number,
            default:0
        },
        timeTaken:{
            type:String,
            default:new Date().toISOString()
        }
    }],
    monthlyLikesGained:[{
        gainedLikes:{
            type:Number,
            default:0
        },
        gainedFollowers:{
            type:Number,
            default:0
        },
        timeTaken:{
            type:String,
            default:new Date().toISOString()
        }
    }],
    yearlyLikesGained:[{
        gainedLikes:{
            type:Number,
            default:0
        },
        gainedFollowers:{
            type:Number,
            default:0
        },
        timeTaken:{
            type:String,
            default:new Date().toISOString()
        }
    }]

},
{ timestamps: true })


instaUserDetail.plugin(mongoosePaginate);
module.exports = mongoose.model('instaUserDetail', instaUserDetail)