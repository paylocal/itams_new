const fetch = require("node-fetch");

async function test() {
  const res = await fetch("http://localhost:3000/api/admin/translations", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      translations: [
        {
          languageCode: "vi",
          key: "common.test123",
          value: "Test value 123",
          category: "common",
        },
      ],
    }),
  });
  console.log("Status:", res.status);
  console.log("Response:", await res.text());
}

test().catch(console.error);