var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate')
var Schema = mongoose.Schema;

let rules = new Schema({
    userType: {
        type:String,
        default:"ADMIN"
    },
    rule:{
        type:String
    },
    status:{
        type:String,
        enum:["ACTIVE","BLOCK","DELETE"],
        default:"ACTIVE"
    }
},
{ timestamps: true })


rules.plugin(mongoosePaginate);
module.exports = mongoose.model('ruleandregulation', rules)