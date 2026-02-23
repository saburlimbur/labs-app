const morgan = require("morgan");
const logger = require("../utils/logger");

const morganMiddleware = morgan(
  (tokens, req, res) => {
    return JSON.stringify({
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: Number(tokens.status(req, res)),
      responseTime: `${tokens["response-time"](req, res)}ms`,
    });
  },
  {
    stream: {
      write: (message) => {
        const data = JSON.parse(message);
        logger.info("HTTP Request", data);
      },
    },
  },
);

module.exports = morganMiddleware;
