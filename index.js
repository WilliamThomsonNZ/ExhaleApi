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
  console.log("requesteREceieved");
  const userEmail = req.query.email;
  if (userEmail === "")
    res.json({
      code: 400,
      message: "error when trying to sign up new customer",
    });
  try {
    await mailChimpSignUp(userEmail);
    res.json({ code: 200, message: "Successfully added user to email list" });
  } catch (err) {
    console.log(err);
    res.json({
      code: err.status,
      message: "error when trying to sign up new customer",
    });
  }
});

// Initialize server
app.listen(6000, () => {
  console.log("Running on port 5000.");
});

// Export the Express API
module.exports = app;
