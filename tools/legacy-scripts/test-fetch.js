const fetch = (await import("node-fetch")).default;

async function test() {
  console.log("=== GET /api/languages ===");
  const r1 = await fetch("http://localhost:3000/api/languages");
  console.log("Status:", r1.status);
  console.log("Headers:", JSON.stringify([...r1.headers.entries()]));
  console.log("Body:", JSON.stringify(await r1.json()).substring(0, 200));

  console.log("\n=== GET /api/translations/vi ===");
  const r2 = await fetch("http://localhost:3000/api/translations/vi");
  console.log("Status:", r2.status);
  console.log("Body:", JSON.stringify(await r2.json()).substring(0, 300));
}

test();