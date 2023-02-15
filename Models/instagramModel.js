var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate')
var Schema = mongoose.Schema;

let instagramSchema = new Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'Users'
    },
    instagramId:{
        type:String
    },
    profilePic: {
        type: String
    },
    username: {
        type: String
    },
    totalLikes: {
        type: Number
    },
    totalComments: {
        type: Number
    },
    totalFollowers: {
        type: Number
    },
    following:{
        type: String
    },
    timeTaken: {
        type: Number
    },
    biography:{
        type:String
    },
    totalPost:{
        type:String
    },
    engagements:{
        type:String
    },
    isVerified:{
        type:Boolean
    },
    businessAccount:{
        type:Boolean
    },
    topPost:{
        type:Array
    },
    details:{
        type:Boolean,
        default:false
    }

},
    { timestamps: true })


instagramSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('instagramuser', instagramSchema)