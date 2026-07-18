import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStatusColor, getStatusLabel, formatCurrency } from "@/lib/utils";
import { getServerT } from "@/lib/i18n-server";

export default async function PendingPOPage() {
  const session = await getServerSession(authOptions);
  const { t } = await getServerT();
  if (!session) redirect("/login");

  if (session.user.role !== "PURCHASING" && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Lay cac YC da ORDERED (chua co PO)
  const allOrdered = await prisma.assetRequest.findMany({
    where: { status: "ORDERED" },
    include: {
      requester: { select: { name: true, department: true } },
      items: { include: { deviceModel: true } },
    },
    orderBy: { updatedAt: "asc" },
  });

  // Loc YC chua co PO
  const existingPOs = await prisma.purchaseOrderRequest.findMany({
    select: { requestId: true },
  });
  const requestIdsWithPO = new Set(existingPOs.map((p: { requestId: string }) => p.requestId));
  const requests = allOrdered.filter((r: { id: string }) => !requestIdsWithPO.has(r.id));

  return (
    <div className="space-y-4">
            <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{t("po.pendingTitle", "Requests to purchase")}</h1>
          <p className="text-gray-500 mt-1">{requests.length} {t("po.pendingCount", "requests need PO")}</p>
        </div>
        <Link
          href="/purchase-orders/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          {t("po.createMulti", "Create PO (multi select)")}
        </Link>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow text-center text-gray-500">
          {t("po.noPending", "No requests need purchase")}
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div key={req.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Link href={`/requests/${req.id}`} className="font-bold hover:underline">
                      {req.requestNumber}
                    </Link>
                    <span className={`text-xs px-2 py-1 rounded ${getStatusColor(req.status)}`}>
                      {getStatusLabel(req.status)}
                    </span>
                  </div>
                  <h3 className="font-medium">{req.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {req.requester.name} ({req.requester.department})
                  </p>
                                    <p className="text-sm mt-2">
                    {req.items.length} {t("po.items", "items")} | {t("po.total", "Total")}: <strong>{formatCurrency(req.totalAmount || 0)}</strong>
                  </p>
                </div>
                <Link
                  href={`/purchase-orders/new?requestIds=${req.id}`}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 self-center"
                >
                  {t("po.create", "Create PO")}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}