const express = require('express');
const router = express.Router();
const alertMessage = require('../helpers/messenger.js');
const { send_promotions_email, send_poster_email } = require('../helpers/send_email');

const ensureAuthenticated = require('../helpers/auth');

const User = require('../models/User_model');
const Sequelize = require('sequelize');
const { ensureAdminAuthenticated } = require('../helpers/auth');
const Op = Sequelize.Op;

router.get('/account', ensureAdminAuthenticated, (req, res) => {
    //send_sms( 'LOGIN ADMIN ACCOUNT HF', req.user.contact_number);

    res.render('admin/account', { title: "admin", navbar: "admin", style: "admin" });

});

router.get('/users', ensureAdminAuthenticated, (req, res) => {

    User.findAll()
        .then((user_list) => {
            res.render('admin/users_list', { title: "admin - Users List", navbar: "admin", style: "admin", user_list });
        })
        .catch(err => console.log(err));

});

router.get('/marketing', ensureAdminAuthenticated, (req, res) => {

    res.render('admin/marketing', { title: "admin - Marketing", navbar: "admin", style: "admin" });

});

const path = require("path") ;
const multer = require("multer") ;

var storage = multer.diskStorage({
    destination: function (req, file, cb) {

        // Uploads is the Upload_folder_name 
        cb(null, "./public/poster")
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "-" + Date.now() + ".jpg")
    }
})

var upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {

        // Set the filetypes, it is optional 
        var filetypes = /jpeg|jpg|png/;
        var mimetype = filetypes.test(file.mimetype);

        var extname = filetypes.test(path.extname(
            file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }

        cb("Error: File upload only supports the "
            + "following filetypes - " + filetypes);
    }

    // mypic is the name of file attribute 
}).single("posterUpload")

router.post("/uploadPoster", ensureAdminAuthenticated, function (req, res, next) {

    // Error MiddleWare for multer file upload, so if any 
    // error occurs, the image would not be uploaded! 
    upload(req, res, function (err) {

        if (err) {

            // ERROR occured (here it can be occured due 
            // to uploading image of size greater than 
            // 1MB or uploading different file type) 
            res.send(err)
        }
        else {

            // SUCCESS, image successfully uploaded
            //res.send(req.file)
            
            
            User.findAll({ 
                attributes: ['email', 'first_name', 'last_name'],
                raw: true
            })
            .then((user)=> {
                if(user != undefined){
                    console.log(user);
                    send_poster_email(user, req.file);
                }
            })
            alertMessage(res, 'success','Uploaded & Sent Poster', 'fas fa-sign-in-alt', true);
            res.redirect('/admin/marketing');
        }
    })
})

router.post('/marketing', ensureAdminAuthenticated, (req, res) => {
    console.log("POSTPOST")
    console.log(req.files)

    if (req.body.submit == "send default newsletter") {
        console.log("send default clicked");
        
        User.findAll({ 
            attributes: ['email', 'first_name', 'last_name'],
            raw: true
        })
        .then((user)=> {
            if(user != undefined){
                console.log(user);
                alertMessage(res, 'success','Sent Default Poster', 'fas fa-sign-in-alt', true);
                send_promotions_email(user);
            }
        })

    }
    else if (req.body.submit == "upload newsletter") {
        console.log("hoho")
        console.log(req.body)
        User.findAll({ 
            attributes: ['email', 'first_name', 'last_name'],
            raw: true
        })
        .then((user)=> {
            if(user != undefined){
                console.log(user);
                send_poster_email(user, req.body.file);
            }
        })
    }
    else {
        console.log("EH?")
    }

    res.render('admin/marketing', { title: "admin - Marketing", navbar: "admin", style: "admin" });

});

module.exports = router;