import { prisma } from "./prisma";

export async function generateAssetTag(categoryCode: string): Promise<string> {
  const prefix = categoryCode.substring(0, 3).toUpperCase();
  const count = await prisma.asset.count({
    where: { assetTag: { startsWith: prefix } },
  });
  const year = new Date().getFullYear();
  const seq = String(count + 1).padStart(5, "0");
  return `${prefix}-${year}-${seq}`;
}

export function generateQRCode(assetTag: string): string {
  return `QR-${assetTag}`;
}
