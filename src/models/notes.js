const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Note extends Model {
    static associate(models) {
      Note.belongsTo(models.User, {
        foreignKey: "author_id",
        as: "author",
      });
    }
  }
  Note.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      author_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      // author_id: DataTypes.INTEGER, // foreign key ke users
      title: DataTypes.STRING,
      content: DataTypes.TEXT,
      is_pinned: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_archived: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "Note",
      underscored: true,
      paranoid: true,
    },
  );
  return Note;
};
