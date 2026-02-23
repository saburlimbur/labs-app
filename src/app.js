const express = require("express");
const morganMiddleware = require("./middleware/morganMiddleware");
const logger = require("./utils/logger");

const router = require("../src/routes/routes");
const setupSwagger = require("./swagger/swagger");

const app = express();

app.use(morganMiddleware);

app.use(express.json());
app.use(
  express.json({
    type: ["application/json", "text/plain"],
  }),
);
app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.get("/", (req, res) => {
  logger.info("Health check endpoint accessed");

  res.status(200).json({
    status: "success",
    message: "API is running successfully.",
    documentation: "/api-docs",
  });
});

// swagger docs
setupSwagger(app);

// api route
app.use("/api", router);

// 404 handler
app.use((req, res) => {
  logger.warn(`404 Not Found: ${req.originalUrl}`);

  res.status(404).json({
    status: "error",
    message: "The requested resource was not found.",
    path: req.originalUrl,
    suggestion: "Please verify the URL or refer to the API documentation.",
  });
});

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    logger.warn("Invalid JSON received", {
      message: err.message,
      path: req.originalUrl,
    });

    return res.status(400).json({
      message: "Invalid JSON format",
    });
  }

  next(err);
});

// global handler
app.use((err, req, res, next) => {
  logger.error("Unhandled error", {
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
  });

  res.status(500).json({
    message: "Internal Server Error",
  });
});

module.exports = app;
