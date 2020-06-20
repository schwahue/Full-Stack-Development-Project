const accountSid = 'AC82fbac810960a6e8057840da7c2797e8';
const authToken = '07cb6303c8f846968056de9ddf730eaf';
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