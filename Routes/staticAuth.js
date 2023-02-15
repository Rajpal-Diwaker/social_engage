let express = require('express'),
    router = express.Router(),
    staticService = require('../Services/staticService');

router.get('/staticPage', (req, res) => {
    staticService.staticApi(req.body, (data) => {
        res.send(data);
    });
});

router.post('/updateStaticPage', (req, res) => {
    staticService.staticPageUpdate(req.body, (data) => {
        res.send(data);
    });
});

module.exports = router