import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStatusColor, getStatusLabel, getCategoryLabel, formatDate } from "@/lib/utils";
import { Plus, FileText } from "lucide-react";
import { getServerT } from "@/lib/i18n-server";

export default async function RequestsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const { t } = await getServerT();

  let where: any = {};
  if (session.user.role === "EMPLOYEE") {
    where.requesterId = session.user.id;
  } else if (session.user.role === "MANAGER") {
    where = {
      OR: [
        { requesterId: session.user.id },
        { requester: { managerId: session.user.id } },
      ],
    };
  }
  // ADMIN, LEAD, IT_STAFF, PURCHASING xem tat ca

  const requests = await prisma.assetRequest.findMany({
    where,
    include: {
      requester: { select: { id: true, name: true, department: true } },
      approvalSteps: {
        include: { approver: { select: { name: true } } },
        orderBy: { stepNumber: "asc" },
      },
      items: { include: { deviceModel: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const canCreate = session.user.role !== "ADMIN";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("nav.requests", "Asset Requests")}</h1>
          <p className="text-gray-500 mt-1">
            {requests.length} {t("request.count", "requests")}
          </p>
        </div>
        {canCreate && (
          <Link
            href="/requests/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            {t("nav.createRequest", "Create request")}
          </Link>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {requests.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>{t("request.empty", "No requests yet")}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3">{t("request.number", "Request No")}</th>
                <th className="text-left p-3">{t("request.device", "Device")}</th>
                <th className="text-left p-3">{t("request.requester", "Requester")}</th>
                <th className="text-left p-3">{t("common.status", "Status")}</th>
                <th className="text-left p-3">{t("common.createdAt", "Created")}</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => {
                const firstItem = req.items[0];
                return (
                  <tr key={req.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-mono text-xs">{req.requestNumber}</td>
                    <td className="p-3">
                      <Link href={`/requests/${req.id}`} className="font-medium hover:underline">
                        {firstItem?.deviceModel
                          ? `${firstItem.deviceModel.brand} ${firstItem.deviceModel.name}`
                          : req.title}
                      </Link>
                      <p className="text-xs text-gray-500">
                        {req.items.length > 1
                          ? `${req.items.length} ${t("request.items", "items")}`
                          : getCategoryLabel(firstItem?.deviceModel?.categoryId || "")}
                      </p>
                    </td>
                    <td className="p-3">
                      <p>{req.requester.name}</p>
                      <p className="text-xs text-gray-500">{req.requester.department}</p>
                    </td>
                    <td className="p-3">
                      <span className={`inline-block px-2 py-1 rounded text-xs ${getStatusColor(req.status)}`}>
                        {getStatusLabel(req.status)}
                      </span>
                    </td>
                    <td className="p-3 text-gray-600 text-xs">{formatDate(req.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
