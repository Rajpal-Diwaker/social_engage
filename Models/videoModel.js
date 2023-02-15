var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate')
var Schema = mongoose.Schema;

let videoSchema = new Schema({
    createrId: {
        type: mongoose.Types.ObjectId,
        ref: 'Users'
    },
    link:{
        type:String,
        default:''
    },
    thumbnail:{
        type:String
    },
    title:{
        type:String
    }

},
    { timestamps: true })


videoSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('videos', videoSchema)