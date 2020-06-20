const express = require('express');
const router = express.Router();
const alertMessage = require('../helpers/messenger.js');
const MessagingResponse = require('twilio').twiml.MessagingResponse;

// listening
router.post('/', (req, res) => {
    const twiml = new MessagingResponse();

    twiml.message('The Robots are coming! Head for the hills!');

    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(twiml.toString());
});


module.exports = router;