// Add Express
const express = require("express");
const mailchimp = require("@mailchimp/mailchimp_marketing");
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

//End point to add email to list
app.post("/api/email", async (req, res) => {
  const userEmail = req.query.email;
  if (userEmail === "")
    res.status(400).send("error when trying to sign up new customer");
  try {
    const response = await mailChimpSignUp(userEmail);
    if (response.statusCode == 400) {
      res.status(400).send("error when trying to sign up new customer");
    } else {
      res.status(200).send("Email signed up");
    }
  } catch (err) {
    res.status(400).send("error when trying to sign up new customer");
  }
});

// Initialize server
app.listen(6000, () => {
  console.log("Running on port 5000.");
});

// Export the Express API
module.exports = app;
