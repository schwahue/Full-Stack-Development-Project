const sgMail = require('@sendgrid/mail');
const API_Keys = require('../config/API_Keys');

sgMail.setApiKey(API_Keys.sendgrid.email);

const send_single_email = (user) =>{

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

const send_multiple_email = (recipient_emails) =>{
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

const send_shipping_confirmation_email = (recipient_emails) =>{
    // recepient email must be in array format
    const msg = {
        //to: recipient_emails,
        to: "user.cust.proj@gmail.com",
        from: 'user.ad.proj@gmail.com',
        subject: 'Shipping Confirmation',
        templateId: 'd-b4be4ef8965d48908476f2176cf951a4',
        dynamic_template_data: {
            first_name: 'hieu',
            last_name: 'jh',
            street_address: 'woodlands yishun 16',
            postal_code: 'S793784',
            image_url: "https://i.ibb.co/5vdy0ds/Sub1.png",
            Sender_Name: "LAZOPEE",
            Sender_Address: "Mysterious Hill 61",
            Sender_City: "Singapore",
            Sender_Zip: "S790483",
            order_number: "12345",
            order_link: ""
        },
    };

    sgMail.send(msg).then(() => {
        console.log('Message sent')
    }).catch((error) => {
        console.log(error.response.body);
        // console.log(error.response.body.errors[0].message)
    })
    
}

const send_promotions_email = (recipient_emails) =>{
    // recepient email must be in array format
    const msg = {
        //to: recipient_emails,
        to: "user.cust.proj@gmail.com",
        from: 'user.ad.proj@gmail.com',
        subject: 'Shipping Confirmation',
        templateId: 'd-b6f89938ef6e4ff4aa4137748775154f',
        dynamic_template_data: {
            first_name: 'hieu',
            last_name: 'jh',
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

module.exports = send_shipping_confirmation_email;
