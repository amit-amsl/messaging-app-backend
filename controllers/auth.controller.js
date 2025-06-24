const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const { isProduction } = require("../app");
require("dotenv").config();

const THREE_HOURS = 1000 * 60 * 60 * 3;

const userLogin = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username | !password) {
    return res
      .status(400)
      .json({ message: "Please provide all required fields" });
  }

  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  });
  if (!user) {
    return res.status(401).json({ message: "Invalid Credentials" });
  }

  const passwordHashCompare = await bcrypt.compare(
    password,
    user.password_hash
  );
  if (!passwordHashCompare) {
    return res.status(401).json({ message: "Invalid Credentials" });
  }

  const payload = {
    userId: user.id,
    username: user.username,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "2h" });
  res.cookie("leaf-authToken", token, {
    httpOnly: true,
    secure: isProduction() ? true : false,
    ...(isProduction() && { sameSite: "none" }),
    expires: new Date(Date.now() + THREE_HOURS),
  });
  return res
    .status(200)
    .json({ message: "User has logged in successfully!", user: payload });
});

const userRegistration = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username | !password) {
    return res
      .status(400)
      .json({ message: "Please provide all required fields" });
  }
  const usernameExists = await prisma.user.findUnique({
    where: {
      username,
    },
  });
  if (usernameExists) {
    return res
      .status(400)
      .json({ message: "Username already exists, please choose another one!" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const createUser = await prisma.user.create({
    data: {
      username,
      password_hash: hashedPassword,
    },
  });

  const payload = {
    userId: createUser.id,
    username: createUser.username,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "2h",
  });
  res.cookie("leaf-authToken", token, {
    httpOnly: true,
    secure: isProduction() ? true : false,
    ...(isProduction() && { sameSite: "none" }),
    expires: new Date(Date.now() + THREE_HOURS),
  });
  return res.status(201).json({
    message: "User has been created successfully!",
    user: payload,
  });
});

const userLogout = (req, res) => {
  const authToken = req.cookies["leaf-authToken"];
  if (!authToken) {
    return res.status(400).json({ message: "Bad request" });
  }

  res.clearCookie("leaf-authToken", {
    httpOnly: true,
    secure: isProduction() ? true : false,
    ...(isProduction() && { sameSite: "none" }),
  });
  return res
    .status(200)
    .json({ msg: `User has been logged out successfully!` });
};

module.exports = {
  userLogin,
  userLogout,
  userRegistration,
};
