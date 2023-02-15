var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate')
var Schema = mongoose.Schema;

let contactUsSchema = new Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'Users'
    },
    phone: {
        type: String
    },
    description: {
        type: String
    },
    countryCode: {
        type: String
    },
    subject: {
        type: String
    },
    mergedContact: {
        type: String
    }


},
    { timestamps: true })


contactUsSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('contactus', contactUsSchema)