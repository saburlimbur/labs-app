const BaseController = require("./base");
const { Note } = require("../models");
const { where } = require("sequelize");

class NotesController extends BaseController {
  constructor() {
    super();

    this.createNotes = this.createNotes.bind(this);
    this.findAllNotes = this.findAllNotes.bind(this);
    this.getNoteDetail = this.getNoteDetail.bind(this);
    this.updateNote = this.updateNote.bind(this);
    this.deleteNote = this.deleteNote.bind(this);
    this.restoreNote = this.restoreNote.bind(this);
    this.togglePin = this.togglePin.bind(this);
    this.toggleArchive = this.toggleArchive.bind(this);
  }

  async createNotes(req, res) {
    try {
      const { title, content, is_pinned, is_archive } = req.body;
      const userId = req.user.id;

      if (
        !title ||
        !content ||
        is_pinned === undefined ||
        is_archive === undefined
      ) {
        return this.sendError(res, "Please, complete all fields!", 400);
      }

      const newNote = await Note.create({
        title,
        content,
        is_pinned,
        is_archive,
        author_id: userId,
      });

      return this.sendSuccess(res, newNote, "Notes created succesfully");
    } catch (err) {
      console.log(err, "error");
      return this.sendError(res, err.message);
    }
  }

  async findAllNotes(req, res) {
    try {
      const { page = 1, limit = 10, search } = req.query;

      const whereNote = {
        author_id: req.user.id,
      };

      if (search) {
        whereNote[Op.or] = [
          {
            title: {
              [Op.iLike]: `%${search}%`,
            },
          },
          {
            content: {
              [Op.iLike]: `%${search}%`,
            },
          },
        ];
      }

      const notes = await Note.findAndCountAll({
        where: whereNote,
        attributes: {
          exclude: ["is_archived"],
        },
        limit: parseInt(limit),
        offset: (page - 1) * limit,
        order: [["created_at", "DESC"]],
      });

      return this.sendSuccess(
        res,
        {
          total: notes.count,
          totalPages: Math.ceil(notes.count / limit),
          currentPage: parseInt(page),
          data: notes.rows,
        },
        "Retrieved notes successfully",
      );
    } catch (err) {
      console.log(err, "error");
      return this.sendError(res, err.message);
    }
  }

  async getNoteDetail(req, res) {
    try {
      const { id } = req.params;

      const note = await Note.findOne({
        where: {
          id,
          author_id: req.user.id,
        },
      });

      if (!note) {
        return this.sendError(res, "Note not found", 404);
      }

      return this.sendSuccess(res, note, "Note retrieved successfully");
    } catch (err) {
      return this.sendError(res, err.message);
    }
  }

  async updateNote(req, res) {
    try {
      const { id } = req.params;
      const { title, content, is_pinned, is_archive } = req.body;

      const [updated] = await Note.update(
        {
          title,
          content,
          is_pinned,
          is_archive,
        },
        {
          where: {
            id: id,
          },
        },
      );

      if (updated === 0) {
        return this.sendError(res, "Notes not found", 404);
      }

      // new data response (find method query)
      const updatedNote = await Note.findByPk(id);

      return this.sendSuccess(res, updatedNote, "Notes updated succesfully");
    } catch (err) {
      console.log(err, "error");
      return this.sendError(res, err.message);
    }
  }

  // soft delete
  async deleteNote(req, res) {
    try {
      const { id } = req.params;

      const deleted = await Note.destroy({
        where: {
          id,
          author_id: req.user.id,
        },
      });

      if (!deleted) {
        return this.sendError(res, "Note not found or unauthorized", 404);
      }

      return this.sendSuccess(res, null, "Note deleted successfully");
    } catch (err) {
      return this.sendError(res, err.message);
    }
  }

  async restoreNote(req, res) {
    try {
      const { id } = req.params;

      await Note.restore({
        where: {
          id,
          author_id: req.user.id,
        },
      });

      return this.sendSuccess(res, null, "Note restored successfully");
    } catch (err) {
      return this.sendError(res, err.message);
    }
  }

  async togglePin(req, res) {
    try {
      const { id } = req.params;

      const note = await Note.findOne({
        where: { id, author_id: req.user.id },
      });

      if (!note) {
        return this.sendError(res, "Note not found", 404);
      }

      await note.update({
        is_pinned: !note.is_pinned,
      });

      return this.sendSuccess(res, note, "Pin status updated");
    } catch (err) {
      return this.sendError(res, err.message);
    }
  }

  async toggleArchive(req, res) {
    try {
      const { id } = req.params;

      const note = await Note.findOne({
        where: { id, author_id: req.user.id },
      });

      if (!note) {
        return this.sendError(res, "Note not found", 404);
      }

      await note.update({
        is_archived: !note.is_archived,
      });

      return this.sendSuccess(res, note, "Archive status updated");
    } catch (err) {
      return this.sendError(res, err.message);
    }
  }
}

module.exports = new NotesController();
