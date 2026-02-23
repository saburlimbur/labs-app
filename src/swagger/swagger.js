const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./api.docs.json");

const setupSwagger = (app) => {
  const options = {
    customCssUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css",
    customJs: [
      "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js",
      "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js",
    ],
  };

  app.use(
    "/api/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, options),
  );
};

module.exports = setupSwagger;
