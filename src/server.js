require("dotenv").config();

const db = require("./models");
const app = require("./app");
const logger = require("./utils/logger");

const PORT = process.env.PORT || 3000;

process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception", {
    message: err.message,
    stack: err.stack,
  });

  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  logger.error("Unhandled Rejection", {
    message: err.message,
    stack: err.stack,
  });

  process.exit(1);
});

const startServer = async () => {
  try {
    await db.sequelize.authenticate();
    logger.info("Database connected successfully");

    const server = app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });

    process.on("SIGTERM", () => {
      logger.warn("SIGTERM received. Shutting down gracefully...");
      server.close(() => {
        logger.info("Process terminated");
        process.exit(0);
      });
    });

    process.on("SIGINT", () => {
      logger.warn("SIGINT received. Shutting down gracefully...");
      server.close(() => {
        logger.info("Process terminated");
        process.exit(0);
      });
    });
  } catch (err) {
    logger.error("Failed to connect to database", {
      message: err.message,
      stack: err.stack,
    });

    process.exit(1);
  }
};

startServer();
