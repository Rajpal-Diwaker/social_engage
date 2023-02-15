var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate')
var Schema = mongoose.Schema;

let groupSchema = new Schema({
    createrId: {
        type: mongoose.Types.ObjectId,
        ref: 'Users'
    },
    groupMembers: [{
        groupMember: {
            type: mongoose.Types.ObjectId,
            ref: 'Users'
        },
        dateOfjoining: {
            type: Date,
            default: new Date()
        },
        status: {
            type: String,
            enum: ["ACTIVE", "BLOCK", "DELETED"],
            default: "ACTIVE"
        },
    }],
    groupStatus: {
        type: String,
        enum: ["ACTIVE", "BLOCK", "DELETED"],
        default: "ACTIVE"
    },
    groupType: {
        type: String,
        enum: ["LIKE", "COMMENT", "LIKEANDCOMMENT", "CHAT", "VERIFIEDUSERS"]
    },
    groupName: {
        type: String,
        trim: true
    },
    groupPic: {
        type: String,
        default: ''
    },
    coverPic: {
        type: String,
        default: ''
    },
    memberCount:{
        type:Number,
        default:1
    }

},
    { timestamps: true })


groupSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('groups', groupSchema)