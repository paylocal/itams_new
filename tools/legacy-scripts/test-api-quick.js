async function test() {
  console.log("=== Test GET /api/translations/vi ===");
  const res = await fetch("http://localhost:3000/api/translations/vi");
  console.log("Status:", res.status);
  const data = await res.json();
  console.log("Count:", Object.keys(data).length);
  console.log("First 3 keys:", Object.keys(data).slice(0, 3));
  console.log("First 3 values:");
  for (const k of Object.keys(data).slice(0, 3)) {
    console.log("  " + k + " = " + data[k]);
  }
}

test();