const express = require('express');
const router = express.Router();
const alertMessage = require('../helpers/messenger.js');

router.get('/account', (req, res) => {

    res.render('admin/account', {title:"admin", navbar:"admin"}); 

});


module.exports = router;