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
  logger.info("Health api root");

  res.json({
    status: "ok",
    message: "hello jokowi",
  });
});

// swagger docs
setupSwagger(app);

// api route
app.use("/api", router);

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
