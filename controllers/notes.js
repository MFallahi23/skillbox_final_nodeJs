const {
  addNote,
  getAllNotes,
  getNote,
  editNote,
  changeArchiveStatus,
  deleteNote,
  deleteAllArchivedNotes,
} = require("../db/notes");
const showdown = require("showdown");
const converter = new showdown.Converter();
const puppeteer = require("puppeteer");
const { validationResult } = require("express-validator");

const getNotes = async (req, res) => {
  const userId = req.user.id;
  const { age = "1week", page = 1, search = "" } = req.query;
  const limit = 10;

  try {
    const isArchived = age === "archive";
    const filterMap = { "1week": 7, "1month": 30, "3months": 90, alltime: 0 };
    const filter = filterMap[age] ?? 7;

    const pageNumber = Number(page) || 1;
    const { notes, hasMore } = await getAllNotes(userId, { isArchived, filter, pageNumber, search }, limit);

    res.status(200).json({ data: notes, hasMore });
  } catch (error) {
    console.log(`Error during getting notes: ${error}`);
    res.status(500).json({ error: "Internal error" });
  }
};

const getNoteById = async (req, res) => {
  const { id } = req.params;
  try {
    const note = await getNote(id);

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    const html = converter.makeHtml(note.text);
    res.status(200).json({ ...note, html });
  } catch (error) {
    console.log(`Error during getting note: ${error}`);
    res.status(500).json({ error: "Internal error" });
  }
};

const createNote = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  const { title, text } = req.body;
  const userId = req.user.id;

  try {
    const note = await addNote(title, text, userId);
    res.status(201).json({ note });
  } catch (error) {
    console.log(`Error during adding notes: ${error}`);
    res.status(500).json({ error: "Internal error" });
  }
};

const updateNote = async (req, res) => {
  const { title, text } = req.body;
  const { id } = req.params;

  try {
    const updatedNote = await editNote(id, title, text);
    res.status(200).json({ note: updatedNote });
  } catch (error) {
    console.log(`Error during updating note: ${error}`);
    res.status(500).json({ error: "Internal error" });
  }
};

const archiveNote = async (req, res) => {
  const { id } = req.params;

  try {
    await changeArchiveStatus(id, true);
    res.status(200).json({ message: "Successfully changed archive status" });
  } catch (error) {
    console.log(`Error during archiving note: ${error}`);
    res.status(500).json({ error: "Internal error" });
  }
};

const unarchiveNote = async (req, res) => {
  const { id } = req.params;

  try {
    await changeArchiveStatus(id, false);
    res.status(200).json({ message: "Successfully changed archive status" });
  } catch (error) {
    console.log(`Error during unarchiving note: ${error}`);
    res.status(500).json({ error: "Internal error" });
  }
};

const removeNote = async (req, res) => {
  const { id } = req.params;

  try {
    await deleteNote(id);
    res.status(200).json({ message: "Note deleted successfully" });
  } catch (error) {
    console.log(`Error during deleting note: ${error}`);
    res.status(500).json({ error: "Internal error" });
  }
};

const removeAllArchivedNotes = async (req, res) => {
  const userId = req.user.id;
  try {
    await deleteAllArchivedNotes(userId);
    res.status(200).json({ message: "Notes deleted successfully" });
  } catch (error) {
    console.log(`Error during deleting notes: ${error}`);
    res.status(500).json({ error: "Internal error" });
  }
};

const downloadPdf = async (req, res) => {
  const { id } = req.params;

  try {
    const note = await getNote(id);

    if (!note) {
      return res.status(404);
    }

    const html = converter.makeHtml(note.text);
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    await page.emulateMediaType("screen");
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "1cm",
        bottom: "1cm",
        left: "1cm",
        right: "1cm",
      },
    });

    await browser.close();
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="note-${id}.pdf"`,
      "Content-Length": pdfBuffer.length,
      "Cache-Control": "no-cache",
    });

    res.end(pdfBuffer);
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).json({ error: "Internal error during PDF generation" });
  }
};

module.exports = {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  archiveNote,
  unarchiveNote,
  removeNote,
  removeAllArchivedNotes,
  downloadPdf,
};
