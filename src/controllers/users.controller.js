const BaseController = require("./base");
const bcrypt = require("bcrypt");
const { User, Note, sequelize } = require("../models");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");

class UsersController extends BaseController {
  constructor() {
    super();

    this.registerUser = this.registerUser.bind(this);
    this.loginUser = this.loginUser.bind(this);
    this.findAllUsers = this.findAllUsers.bind(this);
    this.profileUser = this.profileUser.bind(this);
    this.getUserDetail = this.getUserDetail.bind(this);
    this.updateProfile = this.updateProfile.bind(this);
    this.changePassword = this.changePassword.bind(this);
    this.deleteProfile = this.deleteProfile.bind(this);
  }

  async registerUser(req, res) {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return this.sendError(res, "All fields are required", 400);
      }

      // uniq email
      const existing = await User.findOne({
        where: {
          email,
        },
      });
      if (existing) {
        return this.sendError(res, "Email already registered", 400);
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
      });

      const userResponse = newUser.toJSON();
      delete userResponse.password;

      return this.sendSuccess(res, userResponse, "Registered successfully");
    } catch (err) {
      return this.sendError(res, err.message);
    }
  }

  async loginUser(req, res) {
    try {
      const { email, name, password } = req.body || {};
      const identifier = email || name;

      if (!identifier || !password) {
        return this.sendError(res, "Identifier and password required", 400);
      }

      const user = await User.findOne({
        where: {
          [Op.or]: [{ email: identifier }, { name: identifier }],
        },
      });

      if (!user) {
        return this.sendError(res, "User not found", 404);
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return this.sendError(res, "Wrong password", 401);
      }

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        process.env.JWT_SECRET_KEY || "rezim",
        { expiresIn: "1d" },
      );

      const userResponse = user.toJSON();
      delete userResponse.password;

      return this.sendSuccess(
        res,
        { user: userResponse, token },
        "Login success",
      );
    } catch (err) {
      return this.sendError(res, err.message);
    }
  }

  async findAllUsers(req, res) {
    try {
      const { page = 1, limit = 10, search } = req.query;

      const whereCondition = {};

      // pagination
      if (search) {
        whereCondition[Op.or] = [
          {
            name: {
              [Op.iLike]: `%${search}%`,
            },
          },
          {
            email: {
              [Op.iLike]: `%${search}%`,
            },
          },
        ];
      }

      const users = await User.findAndCountAll({
        where: whereCondition,
        attributes: {
          exclude: ["password"],
        },
        limit: parseInt(limit),
        offset: (page - 1) * limit,
        order: [["created_at", "DESC"]], // descending
      });

      return this.sendSuccess(res, {
        total: users.count,
        totalPages: Math.ceil(users.count / limit),
        currentPage: parseInt(page),
        users: users.rows,
      });
    } catch (err) {
      return this.sendError(res, err.message);
    }
  }

  async profileUser(req, res) {
    try {
      const userId = req.user.id; // from session

      const user = await User.findByPk(userId, {
        attributes: {
          exclude: ["password"],
        },
        include: [
          {
            association: "notes",
            model: User.associations.notes.target,
            required: false,
          },
        ],
      });

      if (!user) {
        return this.sendError(res, "User not found", 404);
      }

      return this.sendSuccess(res, user, "My profile retrieved successfully");
    } catch (err) {
      return this.sendError(res, err.message);
    }
  }

  async getUserDetail(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id, {
        attributes: {
          exclude: ["password"],
        },
        include: [
          {
            association: "notes",
            model: User.associations.notes.target,
            required: false,
          },
        ],
      });

      if (!user) {
        return this.sendError(res, "User not found", 404);
      }

      return this.sendSuccess(res, user, "User detail retrieved");
    } catch (err) {
      return this.sendError(res, err.message);
    }
  }

  async updateProfile(req, res) {
    try {
      const { name, email } = req.body;

      const user = await User.findByPk(req.user.id);

      if (!user) {
        return this.sendError(res, "User not found", 404);
      }

      // check email exist
      if (email && email !== user.email) {
        const existing = await User.findOne({
          where: {
            email,
          },
        });
        if (existing) {
          return this.sendError(res, "Email already in use", 400);
        }
      }

      await user.update({
        name: name ?? user.name,
        email: email ?? user.email,
      });

      const userResponse = user.toJSON();
      delete userResponse.password;

      return this.sendSuccess(res, userResponse, "Profile updated");
    } catch (err) {
      return this.sendError(res, err.message);
    }
  }

  async changePassword(req, res) {
    try {
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        return this.sendError(res, "Both passwords required", 400);
      }

      const user = await User.findByPk(req.user.id);

      const match = await bcrypt.compare(oldPassword, user.password);
      if (!match) {
        return this.sendError(res, "Old password incorrect", 400);
      }

      const hashed = await bcrypt.hash(newPassword, 10);
      await user.update({
        password: hashed,
      });

      return this.sendSuccess(res, null, "Password changed successfully");
    } catch (err) {
      return this.sendError(res, err.message);
    }
  }

  async deleteProfile(req, res) {
    const t = await sequelize.transaction();
    try {
      const userId = req.user.id;

      // soft delete all notes user with trasaction
      await Note.destroy({
        where: {
          author_id: userId,
        },
        transaction: t,
      });

      // soft delete user
      await User.destroy({
        where: {
          id: userId,
        },
        transaction: t,
      });

      await t.commit();
      return this.sendSuccess(res, null, "Account inactivated successfully");
    } catch (err) {
      await t.rollback();
      return this.sendError(res, err.message);
    }
  }
}

module.exports = new UsersController();
