import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Package, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getServerT } from "@/lib/i18n-server";

export default async function PendingPOPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const { t } = await getServerT();

  if (session.user.role !== "PURCHASING") {
    redirect("/purchase-orders");
  }

  const allOrdered = await prisma.assetRequest.findMany({
    where: { status: "ORDERED" },
    include: {
      requester: { select: { name: true, department: true } },
      items: { include: { deviceModel: true } },
    },
    orderBy: { updatedAt: "asc" },
  });

  const existingPOs = await prisma.purchaseOrderRequest.findMany({
    select: { requestId: true },
  });
  const requestIdsWithPO = new Set(existingPOs.map((p) => p.requestId));
  const requests = allOrdered.filter((r) => !requestIdsWithPO.has(r.id));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{t("po.pendingTitle", "Requests pending PO")}</h1>
          <p className="text-gray-500 mt-1">{requests.length} {t("po.pendingCount", "requests need PO")}</p>
        </div>
        <Link
          href="/purchase-orders/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          {t("po.createFromSelection", "Create PO from selection")}
        </Link>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow text-center text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>{t("po.noPending", "No requests need PO")}</p>
          <p className="text-xs mt-2">{t("po.pendingHint", "Requests appear here after Manager and IT approval")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div key={req.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Link
                      href={`/requests/${req.id}`}
                      className="font-bold hover:underline"
                    >
                      {req.requestNumber}
                    </Link>
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
                      {t("status.ORDERED", "Ordered")}
                    </span>
                  </div>
                  <h3 className="font-medium">{req.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {req.requester.name}
                    {req.requester.department && " (" + req.requester.department + ")"}
                  </p>
                  <p className="text-sm mt-2">
                    {req.items.length} {t("request.items", "items")} | {t("common.total", "Total")}:{" "}
                    <strong>{formatCurrency(req.totalAmount || 0)}</strong>
                  </p>
                </div>
                <Link
                  href={`/purchase-orders/new?requestIds=${req.id}`}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 self-center flex items-center gap-1"
                >
                  {t("po.create", "Create PO")} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
