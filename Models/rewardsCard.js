var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate')
var Schema = mongoose.Schema;

let rewardsCard = new Schema({
    userType: {
        type:String,
        default:"ADMIN"
    },
    image:{
        type:String
    },
    rewardPoint:{
        type:Number
    },
    heading:{
        type:String
    },
    validity:{
        type:String
    },
    timeStamp:{
        type:Number
    }

},
{ timestamps: true })


rewardsCard.plugin(mongoosePaginate);
module.exports = mongoose.model('rewardscards', rewardsCard)