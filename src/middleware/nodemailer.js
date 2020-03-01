
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'andrew13ayman@gmail.com',
      pass: 'andrewhanna'
    }
  });
  
  /* var mailOptions = {
    from: 'andrew13ayman@gmail.com',
    to: 'andrew13ayman@gmail.com',
    subject: 'Sending your password',
    text: 'That was easy!'
  }; */
  
  
 
  let sendMail = (mailOptions)=>{
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
  };
 

  module.exports = sendMail  ;