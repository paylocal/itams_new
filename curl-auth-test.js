const fetch = require("node-fetch");

async function test() {
  // Lay tu DevTools: next-auth.session-token
  const sessionToken = "PASTE_TOKEN_HERE";
  const cookies = `next-auth.session-token=${sessionToken}`;

  console.log("=== Test GET ===");
  const res1 = await fetch("http://localhost:3000/api/admin/translations", {
    headers: { Cookie: cookies },
  });
  console.log("Status:", res1.status);
  const data = await res1.json();
  console.log("Data:", JSON.stringify(data).substring(0, 200));

  console.log("\n=== Test PUT ===");
  const res2 = await fetch("http://localhost:3000/api/admin/translations", {
    method: "PUT",
    headers: { Cookie: cookies, "Content-Type": "application/json" },
    body: JSON.stringify({
      translations: [
        { languageCode: "vi", key: "test.curl", value: "YEs!", category: "common" },
      ],
    }),
  });
  console.log("Status:", res2.status);
  console.log("Response:", await res2.text());
}

test();