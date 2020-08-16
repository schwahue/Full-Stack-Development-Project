const sgMail = require('@sendgrid/mail');
const API_Keys = require('../config/API_Keys');

sgMail.setApiKey(API_Keys.sendgrid.email);

const send_single_email = (user) => {

    const msg = {
        to: user.email,
        from: 'user.ad.proj@gmail.com',
        subject: 'Promotional Email',
        text: 'and easy to do anywhere, even with Node.js',
        html: '<strong>and easy to do anywhere, even with Node.js</strong>',
    };

    sgMail.send(msg).then(() => {
        console.log('Message sent')
    }).catch((error) => {
        console.log(error.response.body)
        // console.log(error.response.body.errors[0].message)
    })
}

const send_multiple_email = (recipient_emails) => {
    // recepient email must be in array format
    const msg = {
        to: recipient_emails,
        from: 'user.ad.proj@gmail.com',
        subject: 'Promotional Email',
        text: 'and easy to do anywhere, even with Node.js',
        html: '<strong>and easy to do anywhere, even with Node.js</strong>',
    };

    sgMail.sendMultiple(msg).then(() => {
        console.log('Message sent')
    }).catch((error) => {
        console.log(error.response.body)
        // console.log(error.response.body.errors[0].message)
    })

}

const send_promotions_email = (recipient_emails) => {
    // recepient email must be in array format
    const msg = {
        to: recipient_emails,
        from: 'user.ad.proj@gmail.com',
        subject: 'Promotional Newsletter',
        templateId: 'd-b6f89938ef6e4ff4aa4137748775154f',
        dynamic_template_data: {
            image_url: "../public/image/poster.jpeg"
            //image_url: "https://i.ibb.co/5vdy0ds/Sub1.png",
            //order_link: ""
        },
    };

    sgMail.send(msg).then(() => {
        console.log('Message sent')
    }).catch((error) => {
        console.log(error.response.body);
        // console.log(error.response.body.errors[0].message)
    })

}

var fs = require('fs');
const path = require("path") ;

function base64_encode(poster) {
    
    //fs.readFile('../public/poster/' + poster.filename, (err, data) => {
    console.log("HOHOHO");
    //console.log(__dirname);
    //console.log(__dirname + '../public/poster/' + poster.filename);
    console.log(path.resolve(__dirname, '../public/poster/' + poster.filename));
    /*
    fs.readFileSync(path.resolve(__dirname, '../public/poster/' + poster.filename), (err, data) => {
        if (err) throw err;
        // read binary data
        //var bitmap = fs.readFileSync(data);
        // convert binary data to base64 encoded string
        console.log("POPOPOPO");
        console.log(data);
        return new Buffer(data).toString('base64');
    });*/

    var data = fs.readFileSync(path.resolve(__dirname, '../public/poster/' + poster.filename));
    return new Buffer(data).toString('base64');
}

const send_poster_email = (recipient_emails, poster) => {
    // recepient email must be in array format
    console.log("ENTER")
    console.log(poster);
    const msg = {
        to: recipient_emails,
        from: 'user.ad.proj@gmail.com',
        subject: 'Promotional Newsletter',
        html: `<html><body> <img src="cid:posterid" width="100%";/> </body></html>`,
        attachments: [
            {
                content: base64_encode(poster),
                filename: poster.filename,
                type: poster.mimetype,
                cid: 'posterid',
                content_id: 'posterid',
                disposition: 'inline'
            },
        ],


    };

    sgMail.send(msg).then(() => {
        console.log('Message sent')
    }).catch((error) => {
        console.log(error.response.body);
        // console.log(error.response.body.errors[0].message)
    })

}

const send_shipping_confirmation_email = (user, order_id, total_cost) => {
    // recepient email must be in array format
    const msg = {
        to: user.email,
        //to: "user.cust.proj@gmail.com",
        from: 'user.ad.proj@gmail.com',
        subject: 'Shipping Confirmation',
        templateId: 'd-b4be4ef8965d48908476f2176cf951a4',
        dynamic_template_data: {
            first_name: user.first_name,
            last_name: user.last_name,
            street_address: user.street_address,
            postal_code: user.postal_code,
            Sender_Name: "LAZOPEE",
            Sender_Address: "Mysterious Hill 61",
            Sender_City: "Singapore",
            Sender_Zip: "S790483",
            order_number: order_id,
            total_cost: total_cost
        },
    };

    sgMail.send(msg).then(() => {
        console.log('Message sent')
    }).catch((error) => {
        console.log(error.response.body);
        // console.log(error.response.body.errors[0].message)
    })

}


module.exports = { send_shipping_confirmation_email, send_poster_email, send_promotions_email };
