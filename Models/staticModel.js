const mongoose = require('mongoose');
const schema = mongoose.Schema;

var staticPage = new schema(
    {
        title: {
            type: String
        },
        description: {
            type: String
        },
        staticType: {
            type: String,
            default: 'NONE'
        },
        status: {
            type: String,
            enum: ["ACTIVE", "BLOCK", "DELETE"],
            default: "ACTIVE"
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('staticPage', staticPage);

mongoose.model('staticPage', staticPage).find((error, result) => {
    if (result.length == 0) {
        let obj1 = {
            'title': "Terms and Conditions",
            'description': "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida dolor sit amet lacus accumsan et viverra justo commodo. Proin sodales pulvinar sic tempor. Sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nam fermentum, nulla luctus pharetra vulputate, felis tellus mollis orci, sed rhoncus pronin sapien nunc accuan eget.",
            'staticType': 'TERMS'

        };
        let obj2 = {
            'title': "About Us",
            'description': "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida dolor sit amet lacus accumsan et viverra justo commodo. Proin sodales pulvinar sic tempor. Sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nam fermentum, nulla luctus pharetra vulputate, felis tellus mollis orci, sed rhoncus pronin sapien nunc accuan eget.",
            'staticType': 'ABOUT_US'

        };
        let obj3 = {
            'title': "Privacy Policy",
            'description': "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida dolor sit amet lacus accumsan et viverra justo commodo. Proin sodales pulvinar sic tempor. Sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nam fermentum, nulla luctus pharetra vulputate, felis tellus mollis orci, sed rhoncus pronin sapien nunc accuan eget.",
            'staticType': 'PRIVACY'

        };
        let obj4 = {
            'title': "Help",
            'description': "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida dolor sit amet lacus accumsan et viverra justo commodo. Proin sodales pulvinar sic tempor. Sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nam fermentum, nulla luctus pharetra vulputate, felis tellus mollis orci, sed rhoncus pronin sapien nunc accuan eget.",
            'staticType': 'HELP'

        };


        mongoose.model('staticPage', staticPage).create(obj1, obj2, obj3, obj4,
            (error, success) => {
                if (error)
                    console.log("Error is" + error)
                else
                    console.log("Static about_us content saved succesfully.", success);
            })
    }
});