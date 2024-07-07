const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json({limt:"25mb"}));
app.use(express.urlencoded({limt:"25mb"}));
app.use((req,res,next)=>{
  res.setHeader('Access-Control-Allow-Origin',"*");
  next();
})
function sendEmail(userEmail, ticketNo)
{
  return new Promise((resolve,reject)=>{
    var transporter =nodemailer.createTransport({
      service: "gmail",
      auth:{
        user: 'evespvtltd@gmail.com', 
        pass: 'eves1234' 
      }
    });

    const mail_configs ={
      from: 'evespvtltd@gmail.com',
    to: userEmail,
    subject: 'Your Ticket Booking Confirmation',
    text: `Thank you for your booking. Your ticket number is ${ticketNo}.`
    }

    transporter.sendEmail(mail_configs,function(error,info){
      if(error){
        console.log(error);
        return reject({messages:`An error occurred`})
      }

      return resolve({message:`Email sent successfully`})
    })

  })
}

app.post("/",(req,res)=>{
  sendEmail(req,query)
  .then((response)=>response.send(response.message))
  .catch((error)=>res.status(500).send(error.message))
})


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
