const express = require("express");
const router = express.Router();

const notesController = require("../controllers/notes.controller");
const authMiddleware = require("../middleware/authMiddleware");

router.get(
  "/",
  authMiddleware,
  notesController.findAllNotes.bind(notesController),
);
router.get(
  "/:id",
  authMiddleware,
  notesController.getNoteDetail.bind(notesController),
);

// middleware
router.post(
  "/",
  authMiddleware,
  notesController.createNotes.bind(notesController),
);
router.put("/:id", authMiddleware, notesController.updateNote);
router.delete("/:id", authMiddleware, notesController.deleteNote);
router.patch("/:id/restore", authMiddleware, notesController.restoreNote);
router.patch("/:id/pin", authMiddleware, notesController.togglePin);
router.patch("/:id/archive", authMiddleware, notesController.toggleArchive);

module.exports = router;
