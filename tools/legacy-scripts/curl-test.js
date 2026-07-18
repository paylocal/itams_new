const fetch = require("node-fetch");

async function test() {
  console.log("=== TEST 1: GET /api/admin/translations ===");
  try {
    const res = await fetch("http://localhost:3000/api/admin/translations");
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Count:", Array.isArray(data) ? data.length : "ERROR: " + data.error);
  } catch (e) {
    console.log("ERROR:", e.message);
  }

  console.log("\n=== TEST 2: PUT (no auth) ===");
  try {
    const res = await fetch("http://localhost:3000/api/admin/translations", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        translations: [{ languageCode: "vi", key: "test.x", value: "y" }],
      }),
    });
    console.log("Status:", res.status);
    console.log("Response:", await res.text());
  } catch (e) {
    console.log("ERROR:", e.message);
  }
}

test();