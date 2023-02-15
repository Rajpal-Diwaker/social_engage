var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate')
var Schema = mongoose.Schema;

let eventSchema = new Schema({
    createrId: {
        type: mongoose.Types.ObjectId,
        ref: 'Users'
    },
    eventMembers: [{
        eventMember: {
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
    eventStatus: {
        type: String,
        enum: ["ACTIVE", "BLOCK", "DELETED"],
        default: "ACTIVE"
    },
    eventName: {
        type: String,
        trim: true
    },
    eventPic: {
        type: String,
        default: ''
    },
    coverPic: {
        type: String,
        default: ''
    },
    startDate: {
        type: Number
    },
    endDate: {
        type: Number
    },
    memberCount:{
        type:Number,
        default:1
    }

},
    { timestamps: true })


eventSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('events', eventSchema)