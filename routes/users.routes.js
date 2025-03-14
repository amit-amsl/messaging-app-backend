const { Router } = require("express");
const usersRouter = Router();
const {
  getAvailableUsersForPrivateChattingByUserId,
  getUserProfileById,
  updateUserById,
} = require("../controllers/users.controller");
const { userAuthenticationCheck } = require("../middleware/auth.middleware");
const multer = require("../middleware/multer.middleware");

usersRouter.use(userAuthenticationCheck);

usersRouter.get("/contacts-list", getAvailableUsersForPrivateChattingByUserId);

usersRouter.get("/profile/:userId", getUserProfileById);

usersRouter.patch(
  "/:userId",
  multer.uploadImage.single("image"),
  updateUserById
);

module.exports = usersRouter;
