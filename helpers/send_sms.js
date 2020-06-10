const accountSid = 'AC82fbac810960a6e8057840da7c2797e8';
const authToken = '52b2b5ee9d7123cce291a3c79b2a0e94';
const client = require('twilio')(accountSid, authToken);

const send_message = (message, contact_number) =>{
  console.log('sending sms');
  client.messages
    .create({
      body: message,
      from: '+12029338949',
      to: '+65'+ contact_number
      
    })
    .then(message => console.log(message.sid));
}
module.exports = send_message;