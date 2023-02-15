var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate')
var Schema = mongoose.Schema;

let chatSchema = new Schema({
    groupId: {
        type: mongoose.Types.ObjectId,
        ref: 'Users'
    },
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'groups'
    },
    message: {
        type: String
    },
    pushNotificationEnabled: {
        type: Boolean,
        default: false
    },
    name: {
        type: String
    },
    profilePic: {
        type: String
    },
    messageTime:{
        type:Number
    }
},
    { timestamps: true })


chatSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('chatdata', chatSchema)