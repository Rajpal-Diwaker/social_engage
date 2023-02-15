var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate')
var Schema = mongoose.Schema;

let warningSchema = new Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'Users'
    },
    groupId:{
        type:mongoose.Types.ObjectId,
        ref:'groups'
    },
    totalLinksProvided: [{
        urlId:{
            type:mongoose.Types.ObjectId,
            ref:'sharedLinks'
        }
    }],
    pendingAction:[{
        urlId:{
            type:mongoose.Types.ObjectId,
            ref:'sharedLinks'
        }
    }],
    linksBuffer:[{
        urlId:{
            type:mongoose.Types.ObjectId,
            ref:'sharedLinks'
        } 
    }],
    remainingWarning:{
        type:Number,
        default:0
    },
    thresholdTime:{
        type:Number,
        default:0
    }

},
    { timestamps: true })


warningSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('warnings', warningSchema)