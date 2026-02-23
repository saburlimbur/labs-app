module.exports = {
  port: process.env.PORT || "3000",
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET_KEY || "hidupjokowi",
  apiPrefix: "/api",
  corsOrigin: "*",
};
