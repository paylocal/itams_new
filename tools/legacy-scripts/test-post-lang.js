async function test() {
  const sessionToken = "PASTE_TOKEN_HERE";
  const cookies = `next-auth.session-token=${sessionToken}`;

  console.log("=== Test POST new language ===");
  const res = await fetch("http://localhost:3000/api/admin/languages", {
    method: "POST",
    headers: { Cookie: cookies, "Content-Type": "application/json" },
    body: JSON.stringify({
      code: "ja",
      name: "Japanese",
      flag: "🇯🇵",
      isDefault: false,
      copyFrom: "vi",
    }),
  });
  console.log("Status:", res.status);
  console.log("Response:", await res.text());
}

test();