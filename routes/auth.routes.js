const { Router } = require("express");
const authRouter = Router();
const {
  userLogin,
  userRegistration,
  userLogout,
} = require("../controllers/auth.controller");
const { userAuthenticationCheck } = require("../middleware/auth.middleware");

authRouter.get("/me", userAuthenticationCheck, (req, res) => {
  const user = req.user;
  return res.status(200).json({ message: "Authentication succeeded", user });
});

authRouter.post("/login", userLogin);

authRouter.post("/register", userRegistration);

authRouter.post("/logout", userLogout);

module.exports = authRouter;
