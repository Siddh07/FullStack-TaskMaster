const { Pool } = require("pg"); // used forr connection pool management

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
      },
);

pool.on("connect", () => {
  console.log("Database connected");
});

pool.on("error", (err) => {
  console.log("Database Error", err);
  process.exit(-1); //exit in case of error
});

console.log("Database connected", process.env.DB_PASSWORD);
module.exports = pool;
