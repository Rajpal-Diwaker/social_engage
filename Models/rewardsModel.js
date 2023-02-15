var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate')
var Schema = mongoose.Schema;

let rewards = new Schema({
    userType: {
        type:String,
        default:"ADMIN"
    },
    rewardType:{
        type:String,
        enum:["SIGNUP","POSTING","JOINING","INVITE"]
    },
    rewardPoint:{
        type:Number
    }

},
{ timestamps: true })


rewards.plugin(mongoosePaginate);
module.exports = mongoose.model('rewards', rewards);

(function init() {
    mongoose.model('rewards', rewards).find({ userType: "ADMIN", rewardType: {$in:["SIGNUP","POSTING","JOINING","INVITE"]} }, (err, rewardData) => {
        if (err) {
            console.log("Error in finding admin", err)
        } else if (rewardData.length==0) {
            let obj = {
                "userType":"ADMIN",
                "rewardType":"SIGNUP",
                "rewardPoint":100
            }
            let obj1 = {
                userType:"ADMIN",
                rewardType:"JOINING",
                rewardPoint:50
            }
            let obj2 = {
                userType:"ADMIN",
                rewardType:"INVITE",
                rewardPoint:80
            }
            let obj3 = {
                userType:"ADMIN",
                rewardType:"POSTING",
                rewardPoint:40
            }
            mongoose.model('rewards', rewards).create([obj,obj1,obj2,obj3], (err1, addData) => {
                if (err1) {
                    console.log("Error in creating admin")
                } else {
                    console.log("Rewards created successfully", addData)
                }
            })
        } else {

            console.log("Document already exist",rewardData)
        }
    })
})()