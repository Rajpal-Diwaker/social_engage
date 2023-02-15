var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate')
var Schema = mongoose.Schema;

let tipsTricksSchema = new Schema({
    createrId: {
        type: mongoose.Types.ObjectId,
        ref: 'Users'
    },
    image:{
        type:String,
        default:''
    },
    title:{
        type:String
    },
    description:{
        type:String
    },
    url:{
        type:String
    }

},
    { timestamps: true })

tipsTricksSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('tipsAndTricks', tipsTricksSchema)