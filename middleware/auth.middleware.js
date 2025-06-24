const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
require("dotenv").config();

const userAuthenticationCheck = asyncHandler(async (req, res, next) => {
  const authToken = req.cookies["leaf-authToken"];
  if (!authToken) {
    return res.status(401).json({ message: "Invalid cookie", user: null });
  }
  try {
    const { userId, username } = jwt.verify(authToken, process.env.JWT_SECRET);

    const user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
    });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Authentication Invalid", user: null });
    }

    req.user = { userId, username };
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Authentication Invalid", user: null });
  }
});

const socketAuthCheck = async (authToken) => {
  if (!authToken) {
    return false;
  }
  try {
    const { userId } = jwt.verify(authToken, process.env.JWT_SECRET);

    const user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
    });
    if (!user) {
      return false;
    }
    return { userId };
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  userAuthenticationCheck,
  socketAuthCheck,
};
