let environment = require('./environment').environment;

let serverURLs = {
    "dev": {
        "NODE_SERVER": "http://localhost",
        "NODE_SERVER_PORT": "5000",
        "MONGO_DB": "mongodb://localhost:27017/test",
        "EMAIL_USER": 'prakash.techugo@gmail.com',
        "EMAIL_PASS": 'Techugo@123',
        "EMAIL_HOST": 'smtp.gmail.com',
        "EMAIL_PORT": 465,
        "EMAIL_SECURE": true,
        "SECUREKEY": "TE@HU@o",
        "TWILIOSID": 'ACb89fd0b1e3e38d4005431d3dee33c5be',
        "TWILIOAUTH": '34f2691d09009067f6f7c16410567045',
        "CLIENT_ID": "1490331687804557",
        "CLIENT_SECRET": "92927bc0b4568a253913f5298c191d61"
    },
    "staging": {
        "NODE_SERVER": "http://13.126.131.184",
        "NODE_SERVER_PORT": "8282",
        "MONGO_DB": "mongodb://localhost:27017/engageDB",
        "EMAIL_USER": 'prakash.techugo@gmail.com',
        "EMAIL_PASS": 'Techugo@123',
        "EMAIL_HOST": 'smtp.gmail.com',
        "EMAIL_PORT": 465,
        "EMAIL_SECURE": true,
        "SECUREKEY": "TE@HU@o",
        "TWILIOSID": 'ACb89fd0b1e3e38d4005431d3dee33c5be',
        "TWILIOAUTH": '34f2691d09009067f6f7c16410567045',
        "CLIENT_ID": "1490331687804557",
        "CLIENT_SECRET": "92927bc0b4568a253913f5298c191d61"
    }
}

let config = {
    "OTP_SMS_CONFIG": {
        "url": `${serverURLs[environment].SMS_API}`
    },
    "TWILIO_SID": {
        "url": `${serverURLs[environment].TWILIOSID}`
    },
    "TWILIO_AUTH": {
        "url": `${serverURLs[environment].TWILIOAUTH}`
    },
    "DB_URL": {
        "url": `${serverURLs[environment].MONGO_DB}`
    },
    "NODE_SERVER_PORT": {
        "port": `${serverURLs[environment].NODE_SERVER_PORT}`
    },
    "NODE_SERVER_URL": {
        "url": `${serverURLs[environment].NODE_SERVER}`
    },
    "CRON_PATTERN": {
        "pattern": `${serverURLs[environment].CRON_PATTERN}`
    },
    "SECURITY_KEY": {
        "KEY": `${serverURLs[environment].SECUREKEY}`
    },
    "OTP_EMAIL_CONFIG": {
        // "host": `${serverURLs[environment].EMAIL_HOST}`,
        // "port": `${serverURLs[environment].EMAIL_PORT}`,
        // "secure": `${serverURLs[environment].EMAIL_SECURE}`,
        "service": 'gmail',
        "auth": {
            "user": `${serverURLs[environment].EMAIL_USER}`,
            "pass": `${serverURLs[environment].EMAIL_PASS}`,
        }
    },
    "CLIENT_ID": {
        "clientId": `${serverURLs[environment].CLIENT_ID}`
    },
    "CLIENT_SECRET": {
        "clientSecret": `${serverURLs[environment].CLIENT_SECRET}`
    }
};

module.exports = {
    config: config
};
