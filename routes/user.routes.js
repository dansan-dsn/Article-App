const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const collection = require("../models/user.model");
const userModel = require("../models/user.model");

router
  .post("/signup", async (req, res) => {
    try {
      // generate a token
      const token = jwt.sign({ id: collection._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      const data = {
        email: req.body.email,
        username: req.body.username,
        tel: req.body.tel,
        passToken: token,
        password: req.body.password,
        status: "deactive",
      };

      const comfirmPassword = req.body.comfirmPassword;

      // check if user already exits in the database
      const existingEmail = await collection.findOne({ email: data.email });
      const existingUsername = await collection.findOne({
        username: data.username,
      });

      if (existingEmail || existingUsername)
        return res
          .status(402)
          .json({ message: "Email or username, already in use" });

      if (data.password != comfirmPassword)
        return res.status(400).json({ error: "Password do not match" });

      // hash the password using bcrypt
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(data.password, saltRounds);

      data.password = hashedPassword; // Replace the hash password with the original password

      const userdata = await collection.insertMany(data);

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOption = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: "User Registration",
        html: `
        <h1>User Verification</h1>
        <p>Please click on the link below to verify your account</p>
          <table role="presentation" border="0" cellpadding="0" cellspacing="0">
      <tr>
        <td>
          <a href="http://localhost/api/user/verify?passToken=${token}" style="
            display: inline-block;
            color: white;
            text-decoration: none;
            font-size: 18px;
            background-color: green;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
          ">Click For Authentication</a>
        </td>
      </tr>
    </table>
        `,
      };

      const sendMail = async (transporter, mailOption) => {
        await transporter.sendMail(mailOption);
        console.log("authorization email sent");
        res.status(201).json({
          message: "Successfully registered! and authorization email sent", // login
        });
      };
      sendMail(transporter, mailOption);

      // update the status
      const updateStatus = await collection.findOneAndUpdate(
        { email: data.email },
        { status: "pending" }
      );
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  })

  .get("/verify", async (req, res) => {
    try {
      const { passToken } = req.query;

      if (!passToken)
        return res.status(400).json({ error: "Token is required" });

      // verify the token
      let decoded;
      try {
        decoded = jwt.verify(passToken, process.env.JWT_SECRET);
      } catch (err) {
        return res
          .status(401)
          .json({ error: "Invalid Token or expired token" });
      }

      // verify user using the token
      const user = await collection.findOne({ passToken });
      if (!user) return res.status(404).json({ error: "User not found" });

      // update the status to active
      await collection.findOneAndUpdate(
        { passToken },
        { $set: { status: "active" } }
      );

      res.status(200).json({ message: "Authentication complete." });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  })

  .post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await collection.findOne({ email });

      if (!user) return res.status(404).json({ message: "User not found" });

      if (user.status == "active") {
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch)
          return res.status(422).json({ message: "Incorrect password" });

        user.lastLogin = Date.now();
        await user.save();

        res.status(200).json({ msg: "Login successfully" });
      } else if (user.status == "pending") {
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
          expiresIn: "1h",
        });
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        const mailOption = {
          from: process.env.EMAIL_USER,
          to: process.env.EMAIL_USER,
          subject: "User Verification",
          html: `
          <h1>User Verification</h1>
          <p>Please click on the link below to verify your account</p>
            <table role="presentation" border="0" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <a href="http://localhost/api/user/verify?passToken=${token}" style="
              display: inline-block;
              color: white;
              text-decoration: none;
              font-size: 18px;
              background-color: green;
              padding: 10px 20px;
              border-radius: 5px;
              cursor: pointer;
            ">Click For Authentication</a>
          </td>
        </tr>
      </table>
          `,
        };

        const sendMail = async (transporter, mailOption) => {
          await transporter.sendMail(mailOption);
          console.log("authorization email sent");
          res.status(201).json({
            message: "Successfully registered! and authorization email sent", // login
          });
        };
        sendMail(transporter, mailOption);

        //update the token
        const update = await collection.findOneAndUpdate(
          { email },
          { passToken: token }
        );
        update.save();
      } else {
        return res.status(400).json({ msg: "Account is deactive" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  })

  .put("/deactivate_account", async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await collection.findOne({ email });
      if (!user)
        return res
          .status(404)
          .json({ message: "Cannot find user with this email" });

      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordMatch)
        return res.status(404).json({ message: "Incorrect password" });

      await collection.updateOne({ email: email }, { status: "deactive" });
      res
        .status(200)
        .json({ message: `Account ${user.email} has been deactivated` });
    } catch (error) {
      res.json({ error: error.message });
    }
  })

  .put("/activate_account", async (req, res) => {
    try {
      const email = req.body.email;
      const updateAccount = await collection.findOne({ email: email });
      if (!updateAccount)
        return res.status(404).json({ message: "Account can not be found" });

      const token = jwt.sign({ id: collection._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOption = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: "Account Activation",
        html: `
        <h1>Account Activation</h1>
        <p>Please click on the link below to verify your account</p>
          <table role="presentation" border="0" cellpadding="0" cellspacing="0">
      <tr>
        <td>
          <a href="http://localhost/api/user/verify?passToken=${token}" style="
            display: inline-block;
            color: white;
            text-decoration: none;
            font-size: 18px;
            background-color: green;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
          ">Click for Login</a>
        </td>
      </tr>
    </table>
        `,
      };

      const sendMail = async (transporter, mailOption) => {
        await transporter.sendMail(mailOption);
        console.log("authorization email sent");
        res.status(201).json({
          message: "Successfully registered! and authorization email sent", // login
        });
      };
      sendMail(transporter, mailOption);

      // update the token
      const updatedToken = await collection.findOneAndUpdate(
        { email },
        {
          passToken: token,
        }
      );
      await updatedToken.save();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  })

  .post("/forgot_password", async (req, res) => {
    try {
      const { email } = req.body;
      const user = await collection.findOne({ email });
      if (!user)
        return res.status(404).json({ message: "User can't be found" });
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      const mailOption = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: "Password Reset",
        html: `
          <h1>Password Reset</h1>
          <p>Please click on the link below to reset your password</p>
          <table role="presentation" border="0" cellpadding="0" cellspacing="0">
      <tr>
        <td>
          <a href="http://localhost/api/user/verify_pass_reset?passToken=${token}" style="
            display: inline-block;
            color: white;
            text-decoration: none;
            font-size: 18px;
            background-color: green;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
          ">Reset Password</a>
        </td>
      </tr>
    </table>
        `,
      };

      const sendMail = async (transporter, mailOption) => {
        await transporter.sendMail(mailOption);
        console.log("password reset email sent");
        res.status(200).json({
          message: "password reset email sent", // Reseting password
          token: `${token}`,
        });
      };
      sendMail(transporter, mailOption);
      const code = await collection.findOneAndUpdate(
        { email },
        { passToken: token }
      );
    } catch (error) {
      res.status(505).json({ error: error.message });
    }
  })

  .post("/verify_pass_reset", async (req, res) => {
    try {
      const { password, comfirmPassword } = req.body;
      const { passToken } = req.query;
      if (!passToken)
        return res.status(404).json({ error: "Token is required" });

      let decoded;
      try {
        decoded = jwt.verify(passToken, process.env.JWT_SECRET);
      } catch (error) {
        res.status().json({ message: "Invalid or Expired token" });
      }

      const user = await collection.findOne({ passToken });
      if (!user) return res.status(404).json({ error: "User cannot be found" });

      if (password != comfirmPassword)
        return res.status(400).json({ error: "Password do not match" });

      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword; // update password using the user

      console.log(password);
      await user.save();
      await collection.findOneAndUpdate({ passToken: null });
      res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  })

  .put("/change-password/:_id", async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const { _id } = req.params;
      const user = await collection.findOne({ _id: _id });
      if (!user)
        return res.status(404).json({ message: "user can not be found" });

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch)
        return res.status(201).json({ message: "password is not a match" });

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword; // update password using the user
      await user.save();

      res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  })

  .put("/change-username", async (req, res) => {
    try {
      const { username, email } = req.body;

      const user = await collection.findOne({ email });
      if (!user)
        return res.status(404).json({ message: "user can not be found" });

      if (user.username === username)
        return res.status(409).json({ message: "New username is required!!!" });

      const usernameExists = await collection.findOne({
        username,
      });
      if (usernameExists)
        return res.status(400).json({ message: "Username is already taken" });

      user.username = username;
      await user.save();
      return res.status(200).json({ message: "username changed successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  })

  .put("/change-phone", async (req, res) => {
    try {
      const { tel, email } = req.body;

      const user = await collection.findOne({ email });
      if (!user)
        return res.status(404).json({ message: "user can not be found" });

      if (user.tel === tel)
        return res
          .status(409)
          .json({ message: "Ain't you gonna set a new tel number?" });

      user.tel = tel;
      await user.save();
      return res.status(200).json({ message: "phone changed successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  })

  .put("/change-email", async (req, res) => {
    const { email, password, newEmail } = req.body;
    try {
      const user = await collection.findOne({ email });
      if (!user)
        return res.status(404).json({ message: "user can not be found" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(401).json({ message: "Invalid password" });

      const emailExists = await collection.findOne({ email: newEmail });
      if (emailExists)
        return res.status(400).json({ message: "Email is already taken" });

      user.email = newEmail;
      await user.save();
      return res.status(200).json({ message: "email changed successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  })

  .get("/all_", async (req, res) => {
    try {
      const users = await collection.find({});
      res.status(200).json({ users: users });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  })

  .get("/one/:_id", async (req, res) => {
    try {
      const user = await collection.findOne({ _id: req.params._id });

      if (!user) return res.status(404).json({ message: "User not found" });

      res.json({ message: user }).status(200);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

module.exports = router;
