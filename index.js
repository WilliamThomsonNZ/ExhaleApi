// Add Express
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const mailchimp = require("@mailchimp/mailchimp_marketing");
const bodyParser = require("body-parser");
require("dotenv").config({ path: ".env" });

mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: "us20",
});

const mailChimpSignUp = async (email) => {
  const response = await mailchimp.lists.addListMember(
    process.env.MAILCHIMP_LIST_ID,
    {
      email_address: email,
      status: "pending",
    }
  );
  return response;
};

// Initialize Express
const app = express();
app.use(
  cors({
    origin: ["https://www.exhaleyoga.co.nz", "https://www.exhaleyoga.co.nz/*"],
  })
);
//End point to add email to list
app.post("/api/email", async (req, res) => {
  const userEmail = req.query.email;
  if (userEmail === "")
    res.json({
      code: 400,
      message: "error when trying to sign up new customer: Email Empty",
    });
  try {
    await mailChimpSignUp(userEmail);
    res.json({ code: 200, message: "Successfully added user to email list" });
  } catch (err) {
    console.log(err);
    res.json({
      code: err.status,
      message: "error when trying to sign up new customer",
      error: err,
    });
  }
});

app.get("/", (req, res) => {
  res.json({ message: "API RUNNING" });
});

const transporter = nodemailer.createTransport({
  service: "hotmail",
  auth: {
    user: process.env.NODE_MAILER_EMAIL,
    pass: process.env.NODE_MAILER_PASSWORD,
  },
});

const jsonParser = bodyParser.json();
app.post("/api/contact", jsonParser, (req, res) => {
  const email = req.body.email;
  const name = req.body.name;
  const message = req.body.message;

  const options = {
    from: process.env.NODE_MAILER_EMAIL,
    to: process.env.NODE_MAILER_TO,
    subject: "New form submission from Exhale Yoga contact page",
    text: `
      NAME: ${name}
      EMAIL: ${email}
      MESSAGE: ${message}
    `,
  };
  transporter.sendMail(options, function (err, info) {
    if (err) {
      console.log(err);
      res.json({ code: 400, message: err });
      return;
    }
    res.json({ code: 200, message: info.response });
  });
});

// Initialize server
app.listen(6000, () => {
  console.log("Hot on 6000");
});

// Export the Express API
module.exports = app;
