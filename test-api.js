const fetch = require("node-fetch");

async function main() {
  // Lay YC PENDING_IT
  const { PrismaClient } = require("@prisma/client");
  const prisma = new PrismaClient();

  const request = await prisma.assetRequest.findFirst({
    where: { status: "PENDING_IT" },
  });

  if (!request) {
    console.log("Khong co YC PENDING_IT");
    await prisma.$disconnect();
    return;
  }

  console.log("YC can test:", request.requestNumber, request.id);
  console.log("Status:", request.status);
  console.log("CurrentStep:", request.currentStep);

  await prisma.$disconnect();

  // Can token de test - lay tu browser
  const cookie = "PASTE_YOUR_SESSION_TOKEN_HERE";

  try {
    const res = await fetch(
      "http://localhost:3000/api/requests/" + request.id + "/approve",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: "next-auth.session-token=" + cookie,
        },
        body: JSON.stringify({
          decision: "REJECTED",
          comment: "Test from script",
        }),
      }
    );

    console.log("\nStatus:", res.status);
    const text = await res.text();
    console.log("Response:", text.substring(0, 500));
  } catch (e) {
    console.log("Error:", e.message);
  }
}

main();