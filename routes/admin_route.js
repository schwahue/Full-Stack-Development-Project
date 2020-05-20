const express = require('express');
const router = express.Router();
const alertMessage = require('../helpers/messenger.js');

router.get('/', (req, res) => {

    res.render('admin/overview', {title:"admin", navbar:"admin"}); 

});


module.exports = router;