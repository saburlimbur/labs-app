// const swaggerJsdoc = require("swagger-jsdoc");
// const swaggerUi = require("swagger-ui-express");

// const options = {
//   definition: {
//     openapi: "3.0.0",
//     info: {
//       title: "Note App API",
//       version: "1.0.0",
//       description: "API documentation for Note App (Users & Notes)",
//     },
//     servers: [
//       {
//         url: "http://localhost:3000/api", // base url API
//       },
//     ],
//     components: {
//       securitySchemes: {
//         bearerAuth: {
//           type: "http",
//           scheme: "bearer",
//           bearerFormat: "JWT",
//         },
//       },
//     },
//     security: [{ bearerAuth: [] }],
//   },
//   apis: ["./src/routes/*.js"], // scan all route files
// };

// const specs = swaggerJsdoc(options);

// // call server
// const setupSwagger = (app) => {
//   app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(specs));
// };

// module.exports = setupSwagger;

const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./api.docs.json");

// call server
const setupSwagger = (app) => {
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};

module.exports = setupSwagger;
