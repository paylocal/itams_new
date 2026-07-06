const sql = require("mssql");

const config = {
  server: "118.69.11.20",
  port: 1433,
  user: "sa",
  password: "Nguyen@3012",
  database: "itams",
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

async function test() {
  try {
    console.log("Connecting to SQL Server...");
    const pool = await sql.connect(config);
    console.log("OK! Connected successfully");
    const result = await pool.request().query("SELECT GETDATE() as now");
    console.log("Server time:", result.recordset[0].now);
    await pool.close();
  } catch (e) {
    console.log("ERROR:", e.message);
  }
}

test();