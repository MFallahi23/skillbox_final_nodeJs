const express = require("express");
const {
  getNotes,
  createNote,
  updateNote,
  archiveNote,
  unarchiveNote,
  removeNote,
  removeAllArchivedNotes,
  getNoteById,
  downloadPdf,
} = require("../controllers/notes");
const { body } = require("express-validator");

const router = express.Router();

router.get("/", getNotes);
router.get("/:id", getNoteById);
router.get("/:id/pdf", downloadPdf);

router.post("/", [body("title").trim().notEmpty().withMessage("Title cannot be empty")], createNote);
router.patch("/:id", updateNote);
router.patch("/:id/archive", archiveNote);
router.patch("/:id/unarchive", unarchiveNote);

router.delete("/archive", removeAllArchivedNotes);
router.delete("/:id", removeNote);

module.exports = router;
