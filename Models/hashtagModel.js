var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate')
var Schema = mongoose.Schema;

let hashTagSchema = new Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'Users'
    },
    hashTag:{
        type:Array
    },
    all:[{
        name: {
            type:String
        },
        popularity: {
            type:Number
        },
        hashtagSuggestion:{
            type:Array
        }
    }],
    mappedHashTag:[{
        identity:{
            type:String
        },
        hashTagName:{
            type:String
        },
        title:{
            type:String
        },
        hashSuggestion:{
            type:Array
        }
    }]

},
{ timestamps: true })


hashTagSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('hashTags', hashTagSchema)