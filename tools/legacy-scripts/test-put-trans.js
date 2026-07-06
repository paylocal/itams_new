async function test() {
  const sessionToken = "PASTE_TOKEN_HERE";
  const cookies = `next-auth.session-token=${sessionToken}`;

  console.log("=== Test PUT translations ===");
  const res = await fetch("http://localhost:3000/api/admin/translations", {
    method: "PUT",
    headers: { Cookie: cookies, "Content-Type": "application/json" },
    body: JSON.stringify({
      translations: [
        { languageCode: "vi", key: "test.x", value: "YEs!" },
      ],
    }),
  });
  console.log("Status:", res.status);
  console.log("Response:", await res.text());

  console.log("\n=== GET to verify ===");
  const res2 = await fetch("http://localhost:3000/api/admin/translations", {
    headers: { Cookie: cookies },
  });
  const data = await res2.json();
  const vi = data.find((l) => l.code === "vi");
  const trans = vi?.translations?.find((t) => t.key === "test.x");
  console.log("Result:", trans || "NOT FOUND");
}

test();