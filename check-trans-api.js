const fetch = require("node-fetch");

async function test() {
  const res1 = await fetch("http://localhost:3000/api/admin/translations");
  console.log("Status:", res1.status);
  const data = await res1.json();
  console.log("Languages count:", Array.isArray(data) ? data.length : 0);
  if (Array.isArray(data) && data.length > 0) {
    console.log("First lang code:", data[0].code);
    console.log("First lang translations count:", data[0].translations?.length || 0);
  }
}

test().catch(console.error);