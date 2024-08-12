require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

app.use(express.json());
app.use(cors());

app.post("/create-checkout-session", async (req, res) => {
    try {
        const { events } = req.body;

        // console.log(events);

        const lineItems = [
            {
                price_data: {
                    currency: "inr",
                    product_data: {
                        name: events[0].name,
                    },
                    unit_amount: events[0].price * 1000,
                },
                quantity: events[0].qnty,
            }
        ];

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `${process.env.CLIENT_URL}?success=true`,
            cancel_url: `${process.env.CLIENT_URL}?canceled=true`,
        });

        console.log("Stripe Session: ", session);

        res.json({ id: session.id });
    } catch (error) {
        console.error("Error creating checkout session:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

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

app.listen(7000, () => {
    console.log("server start")
})