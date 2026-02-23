"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // 1. Enable uuid-ossp extension
      await queryInterface.sequelize.query(
        'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";',
        { transaction }
      );

      // 2. Add temporary UUID columns
      await queryInterface.addColumn(
        "users",
        "new_id",
        {
          type: Sequelize.UUID,
          defaultValue: Sequelize.literal("uuid_generate_v4()"),
        },
        { transaction }
      );

      await queryInterface.addColumn(
        "notes",
        "new_id",
        {
          type: Sequelize.UUID,
          defaultValue: Sequelize.literal("uuid_generate_v4()"),
        },
        { transaction }
      );

      await queryInterface.addColumn(
        "notes",
        "new_author_id",
        {
          type: Sequelize.UUID,
          allowNull: true,
        },
        { transaction }
      );

      // 3. Generate UUIDs for existing rows
      await queryInterface.sequelize.query(
        'UPDATE "users" SET "new_id" = uuid_generate_v4();',
        { transaction }
      );

      await queryInterface.sequelize.query(
        'UPDATE "notes" SET "new_id" = uuid_generate_v4();',
        { transaction }
      );

      // 4. Map old author_id to new UUID from users
      await queryInterface.sequelize.query(
        `UPDATE "notes" SET "new_author_id" = "users"."new_id"
         FROM "users"
         WHERE "notes"."author_id" = "users"."id";`,
        { transaction }
      );

      // 5. Drop old foreign key constraint and indexes
      await queryInterface.removeConstraint("notes", "fk_notes_author", {
        transaction,
      });
      await queryInterface.removeIndex("notes", "idx_notes_author_id", {
        transaction,
      });

      // 6. Drop old columns
      await queryInterface.removeColumn("users", "id", { transaction });
      await queryInterface.removeColumn("notes", "id", { transaction });
      await queryInterface.removeColumn("notes", "author_id", { transaction });

      // 7. Rename new columns
      await queryInterface.renameColumn("users", "new_id", "id", {
        transaction,
      });
      await queryInterface.renameColumn("notes", "new_id", "id", {
        transaction,
      });
      await queryInterface.renameColumn("notes", "new_author_id", "author_id", {
        transaction,
      });

      // 8. Add NOT NULL constraints
      await queryInterface.changeColumn(
        "users",
        "id",
        {
          type: Sequelize.UUID,
          allowNull: false,
          defaultValue: Sequelize.literal("uuid_generate_v4()"),
        },
        { transaction }
      );

      await queryInterface.changeColumn(
        "notes",
        "id",
        {
          type: Sequelize.UUID,
          allowNull: false,
          defaultValue: Sequelize.literal("uuid_generate_v4()"),
        },
        { transaction }
      );

      await queryInterface.changeColumn(
        "notes",
        "author_id",
        {
          type: Sequelize.UUID,
          allowNull: false,
        },
        { transaction }
      );

      // 9. Add primary keys back
      await queryInterface.addConstraint("users", {
        fields: ["id"],
        type: "primary key",
        name: "users_pkey",
        transaction,
      });

      await queryInterface.addConstraint("notes", {
        fields: ["id"],
        type: "primary key",
        name: "notes_pkey",
        transaction,
      });

      // 10. Add foreign key and index back
      await queryInterface.addIndex("notes", ["author_id"], {
        name: "idx_notes_author_id",
        transaction,
      });

      await queryInterface.addConstraint("notes", {
        fields: ["author_id"],
        type: "foreign key",
        name: "fk_notes_author",
        references: {
          table: "users",
          field: "id",
        },
        onDelete: "CASCADE",
        transaction,
      });

      // 11. Drop old sequences (no longer needed)
      await queryInterface.sequelize.query(
        "DROP SEQUENCE IF EXISTS users_id_seq;",
        { transaction }
      );
      await queryInterface.sequelize.query(
        "DROP SEQUENCE IF EXISTS notes_id_seq;",
        { transaction }
      );
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // Create sequences
      await queryInterface.sequelize.query(
        "CREATE SEQUENCE users_id_seq;",
        { transaction }
      );
      await queryInterface.sequelize.query(
        "CREATE SEQUENCE notes_id_seq;",
        { transaction }
      );

      // Remove FK and index
      await queryInterface.removeConstraint("notes", "fk_notes_author", {
        transaction,
      });
      await queryInterface.removeIndex("notes", "idx_notes_author_id", {
        transaction,
      });

      // Remove PKs
      await queryInterface.removeConstraint("notes", "notes_pkey", {
        transaction,
      });
      await queryInterface.removeConstraint("users", "users_pkey", {
        transaction,
      });

      // Add temp bigint columns
      await queryInterface.addColumn(
        "users",
        "new_id",
        {
          type: Sequelize.BIGINT,
          defaultValue: Sequelize.literal("nextval('users_id_seq')"),
        },
        { transaction }
      );

      await queryInterface.addColumn(
        "notes",
        "new_id",
        {
          type: Sequelize.BIGINT,
          defaultValue: Sequelize.literal("nextval('notes_id_seq')"),
        },
        { transaction }
      );

      await queryInterface.addColumn(
        "notes",
        "new_author_id",
        { type: Sequelize.BIGINT, allowNull: true },
        { transaction }
      );

      // Populate bigint ids
      await queryInterface.sequelize.query(
        'UPDATE "users" SET "new_id" = nextval(\'users_id_seq\');',
        { transaction }
      );
      await queryInterface.sequelize.query(
        'UPDATE "notes" SET "new_id" = nextval(\'notes_id_seq\');',
        { transaction }
      );
      await queryInterface.sequelize.query(
        `UPDATE "notes" SET "new_author_id" = "users"."new_id"
         FROM "users"
         WHERE "notes"."author_id" = "users"."id";`,
        { transaction }
      );

      // Drop old UUID columns
      await queryInterface.removeColumn("users", "id", { transaction });
      await queryInterface.removeColumn("notes", "id", { transaction });
      await queryInterface.removeColumn("notes", "author_id", { transaction });

      // Rename
      await queryInterface.renameColumn("users", "new_id", "id", {
        transaction,
      });
      await queryInterface.renameColumn("notes", "new_id", "id", {
        transaction,
      });
      await queryInterface.renameColumn("notes", "new_author_id", "author_id", {
        transaction,
      });

      // Set NOT NULL and defaults
      await queryInterface.changeColumn(
        "users",
        "id",
        {
          type: Sequelize.BIGINT,
          allowNull: false,
          defaultValue: Sequelize.literal("nextval('users_id_seq')"),
        },
        { transaction }
      );
      await queryInterface.changeColumn(
        "notes",
        "id",
        {
          type: Sequelize.BIGINT,
          allowNull: false,
          defaultValue: Sequelize.literal("nextval('notes_id_seq')"),
        },
        { transaction }
      );
      await queryInterface.changeColumn(
        "notes",
        "author_id",
        { type: Sequelize.BIGINT, allowNull: false },
        { transaction }
      );

      // PKs
      await queryInterface.addConstraint("users", {
        fields: ["id"],
        type: "primary key",
        name: "users_pkey",
        transaction,
      });
      await queryInterface.addConstraint("notes", {
        fields: ["id"],
        type: "primary key",
        name: "notes_pkey",
        transaction,
      });

      // FK and index
      await queryInterface.addIndex("notes", ["author_id"], {
        name: "idx_notes_author_id",
        transaction,
      });
      await queryInterface.addConstraint("notes", {
        fields: ["author_id"],
        type: "foreign key",
        name: "fk_notes_author",
        references: { table: "users", field: "id" },
        onDelete: "CASCADE",
        transaction,
      });
    });
  },
};
