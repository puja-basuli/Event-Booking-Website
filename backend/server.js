const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'evespvtltd@gmail.com', 
    pass: 'eves1234'   
  }
});

app.post('/api/send-email', (req, res) => {
  const { ticketNo, userEmail } = req.body;

  const mailOptions = {
    from: 'evespvtltd@gmail.com',
    to: userEmail,
    subject: 'Your Ticket Booking Confirmation',
    text: `Thank you for your booking. Your ticket number is ${ticketNo}.`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).send({ success: false, message: 'Email failed to send', error });
    }
    res.status(200).send({ success: true, message: 'Email sent successfully', info });
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
