const API_Keys = require('../config/API_Keys');
const accountSid = API_Keys.twilio.accountSid;
const authToken = API_Keys.twilio.authToken;
const client = require('twilio')(accountSid, authToken);

const send_message = (message, contact_number) =>{
  console.log('sending sms to contact');
  console.log(contact_number);
  client.messages
    .create({
      body: message,
      from: '+12029338949',
      to: '+65'+ contact_number
      
    })
    .then(message => console.log(message.sid))
    .catch(err => console.log(err));
}
module.exports = send_message;