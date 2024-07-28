require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

app.use(express.json());
app.use(cors());

app.post("/api/create-checkout-session",async(req,res)=>{
    const {events} = req.body;


    const lineItems = events.map((product)=>({
        price_data:{
            currency:"usd",
            
            unit_amount:events.price * 100,
        },
        quantity:events.qnty
    }));

    const session = await stripe.checkout.sessions.create({
        payment_method_types:["card"],
        line_items:lineItems,
        mode:"payment",
        success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL}/cancel`
    });

    res.json({id:session.id})
 
})

app.get('/success', async (req, res) => {
    const session = await stripe.checkout.sessions.retrieve(req.query.session_id);

    nodemailer.createTestAccount((err, account) => {
        if (err) {
            console.error('Failed to create a testing account', err);
            return res.status(500).send('Server Error');
        }

        const transporter = nodemailer.createTransport({
            host: account.smtp.host,
            port: account.smtp.port,
            secure: account.smtp.secure, 
            auth: {
                user: account.user, 
                pass: account.pass,
            },
        });

        const mailOptions = {
            from: 'no-reply@example.com',
            to: session.customer_email,
            subject: 'Payment Successful',
            text: `Thank you for your payment of $${session.amount_total / 100}.`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        });
    });

    res.send('Payment Successful');
});

app.listen(7000,()=>{
    console.log("server start")
})

