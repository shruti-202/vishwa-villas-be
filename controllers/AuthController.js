const User = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { usernameValidator, passwordValidator, emailValidator, nameValidator } = require("../constants/Validators");

const salt = bcrypt.genSaltSync(10);

const registerUser = async (req, res) => {
  const { name, phone, email, username, password } = req.body;

  if (!name) {
    return res.status(400).json({
      statusCode: 400,
      error: "Please enter your Name",
    });
  }
  if (name.length < 2 || name.length > 30) {
    return res.status(400).json({
      statusCode: 400,
      error: "Name length should be greater than 1 and less than 30 characters",
    });
  }
  if (!nameValidator(name)) {
    return res.status(400).json({
      statusCode: 400,
      error:
        "Invalid Name Format: First [Last], both start with uppercase, & contains only alphabetical characters",
    });
  }
  if (!email) {
    return res.status(400).json({
      statusCode: 400,
      error: "Please enter your Email Id",
    });
  }
  if (!emailValidator(email)) {
    return res.status(400).json({
      statusCode: 400,
      error: "Invalid Email Format",
    });
  }
  if (!phone) {
    return res.status(400).json({
      statusCode: 400,
      error: "Please enter your Phone Number",
    });
  }
  if (phone < 1000000000) {
    return res.status(400).json({
      statusCode: 400,
      error: "Invalid Phone Number",
    });
  }
  if (!username) {
    return res.status(400).json({
      statusCode: 400,
      error: "Please enter your Username",
    });
  }
  if (!usernameValidator(username)) {
    return res.status(400).json({
      statusCode: 400,
      error:
        "Invalid username! It should have only a-z A-Z 0-9 _ characters and should have 8-30 characters",
    });
  }
  if (!password) {
    return res.status(400).json({
      statusCode: 400,
      error: "Please enter the password",
    });
  }
  if (!passwordValidator(password)) {
    return res.status(400).json({
      statusCode: 400,
      error:
        "Invalid Password! Minimum eight characters, at least one uppercase letter, lowercase letter, number and special character",
    });
  }

  try {
    const userByUsername = await User.findOne({ username: username });
    if (userByUsername) {
      return res.status(400).json({
        statusCode: 400,
        error: "User already Exists",
      });
    }
    const userByEmail = await User.findOne({ email: email });
    if (userByEmail) {
      return res.status(400).json({
        statusCode: 400,
        error: "Email already Exists",
      });
    }
    const userDoc = await User.create({
      name,
      phone,
      email,
      username,
      password: bcrypt.hashSync(password, salt),
    });
    res.status(201).json(userDoc);
  } catch (err) {
    return res.status(400).json({
      statusCode: 400,
      error: "Bad Requests",
    });
  }
};

const loginUser = async (req, res) => {
  const { username, password } = req.body;
  if (!username) {
    return res.status(400).json({
      statusCode: 400,
      error: "Please enter your Username",
    });
  }
  if (!usernameValidator(username)) {
    return res.status(400).json({
      statusCode: 400,
      error:
        "Invalid username! It should have only a-z A-Z 0-9 _ characters and should have 8-30 characters",
    });
  }
  if (!password) {
    return res.status(400).json({
      statusCode: 400,
      error: "Please enter your password",
    });
  }
  if (!passwordValidator(password)) {
    return res.status(400).json({
      statusCode: 400,
      error:
        "Invalid Password! Minimum eight characters, at least one uppercase letter, lowercase letter, number and special character",
    });
  }

  try {
    const userDoc = await User.findOne({ username });
    if (!userDoc) {
      return res.status(400).json({
        statusCode: 400,
        error: "Invalid Username",
      });
    }
    const isPasswordCorrect = bcrypt.compareSync(password, userDoc.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({
        statusCode: 400,
        error: "Invalid Password",
      });
    }
    const token = jwt.sign({ id: userDoc._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1d",
    });
    console.log("token", token);
    return res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
      })
      .status(200)
      .json({
        success: "User Logged In Successfully",
        data: {
          userId: userDoc._id,
          username: userDoc.username,
        },
      });
  } catch (err) {
    res.end("err");
  }
};

module.exports = { registerUser, loginUser };
