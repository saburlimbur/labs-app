const express = require("express");
const router = express.Router();

const usersController = require("../controllers/users.controller");
const authMiddleware = require("../middleware/authMiddleware");

// public
router.post("/register", usersController.registerUser.bind(usersController));
router.post("/login", usersController.loginUser.bind(usersController));
router.get("/detail/:id", usersController.getUserDetail);
router.get("/", usersController.findAllUsers);

// private, using token
router.get(
  "/profile",
  authMiddleware,
  usersController.profileUser.bind(usersController),
);
router.put(
  "/profile",
  authMiddleware,
  usersController.updateProfile.bind(usersController),
);
router.put(
  "/change-password",
  authMiddleware,
  usersController.changePassword.bind(usersController),
);
router.delete(
  "/profile",
  authMiddleware,
  usersController.deleteProfile.bind(usersController),
);

module.exports = router;
