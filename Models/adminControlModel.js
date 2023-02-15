var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate')
var Schema = mongoose.Schema;

var adminControl = new Schema({
    addedBy: {
        type: String,
        default: "ADMIN"
    },
    referralBonus: {
        type: Number,
        default: 0
    },
    signUpBonus: {
        type: Number,
        default: 0
    }

},
    { timestamps: true }
)

adminControl.plugin(mongoosePaginate);
module.exports = mongoose.model('adminControls', adminControl)

mongoose.model('adminControls', adminControl).find((error, result) => {
    if (error) throw error;
    else if (result.length == 0) {
        let obj1 = {
            'referralBonus': 100,
            'signUpBonus': 100
        };

        mongoose.model('adminControls', adminControl).create(obj1,
            (error, success) => {
                if (error)
                    console.log("Error is" + error)
                else
                    console.log("Admin controls saved successfully", success);
            })
    } else {
        console.log('Admin controls already exist')
    }
});