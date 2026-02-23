require("dotenv").config();
const db = require("./src/models/index");

console.log(
  "connecting to:",
  process.env.DATABASE_URL ? "supabase url" : "localhost",
);

db.sequelize
  .authenticate()
  .then(() => {
    console.log("connect success");
    process.exit(0);
  })
  .catch((err) => {
    console.error("connect failed", err.message);
    if (err.message.includes("ENOTFOUND")) {
      console.error(
        "dns problem: your device is not find a supabase address, try again for internet connection",
      );
    }
    process.exit(1);
  });
