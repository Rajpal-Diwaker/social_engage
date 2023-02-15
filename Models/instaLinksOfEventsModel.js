var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate')
var Schema = mongoose.Schema;

let instaEventSchema = new Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'Users'
    },
    eventId: {
        type: mongoose.Types.ObjectId,
        ref: 'groups'
    },
    url: {
        type: String
    },
    instaUserName: {
        type: String
    },
    note: {
        type: String
    },
    instaUrl: {
        type: String
    },
    caption: {
        type: String
    },
    timeTaken: {
        type: String
    }

},
    { timestamps: true })


instaEventSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('sharedLinksInEvents', instaEventSchema)