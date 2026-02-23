const express = require("express");
const router = express.Router();

const notesRoutes = require("./notes.routes");
const usersRoutes = require("./users.routes");

router.use("/notes", notesRoutes);
router.use("/users", usersRoutes);

module.exports = router;
