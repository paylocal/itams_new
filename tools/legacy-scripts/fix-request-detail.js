const fs = require("fs");
const path = require("path");

const code = `import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getStatusColor,
  getStatusLabel,
  formatDate,
  formatCurrency,
} from "@/lib/utils";
import { CheckCircle2, XCircle, Clock, FileText, Check, X } from "lucide-react";

export default async function RequestDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const request = await prisma.assetRequest.findUnique({
    where: { id: params.id },
    include: {
      requester: true,
      approvalSteps: {
        include: { approver: true },
        orderBy: { stepNumber: "asc" },
      },
      items: {
        include: {
          category: true,
          deviceModel: true,
        },
      },
      purchaseOrders: {
        include: {
          purchaseOrder: {
            select: {
              poNumber: true,
              id: true,
              status: true,
            },
          },
        },
      },
    },
  });

  if (!request) notFound();

  // Lay POItem de kiem tra item nao da co PO
  const poItems = await prisma.pOItem.findMany({
    where: { requestItemId: { in: request.items.map((i) => i.id) } },
    include: { po: { select: { poNumber: true, id: true, status: true } } },
  });
  const itemPOs = new Map<string, any>();
  poItems.forEach((p) => {
    if (p.requestItemId) itemPOs.set(p.requestItemId, p.po);
  });

  // Tinh trang thai items
  const totalItems = request.items.length;
  const itemsWithPO = request.items.filter((i) => itemPOs.has(i.id)).length;
  const allItemsHavePO = itemsWithPO === totalItems;

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <Link href="/requests" className="text-sm text-blue-600 hover:underline">
        ← Quay lai
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl font-bold">{request.requestNumber}</h1>
            <span className={\`inline-block px-2 py-1 rounded text-xs \${getStatusColor(request.status)}\`}>
              {getStatusLabel(request.status)}
            </span>
          </div>
          <p className="text-gray-500 text-sm">
            Tao luc {formatDate(request.createdAt)}
          </p>
        </div>
      </div>

      {/* Tien do items */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold">Tien do mua hang</h3>
          <span className={\`text-sm px-2 py-1 rounded \${allItemsHavePO ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}\`}>
            {itemsWithPO} / {totalItems} da co PO
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full"
            style={{ width: totalItems > 0 ? (itemsWithPO / totalItems) * 100 + "%" : "0%" }}
          ></div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Thong tin yeu cau
        </h2>
        <dl className="space-y-2 text-sm">
          <div className="grid grid-cols-3">
            <dt className="text-gray-500">Tieu de:</dt>
            <dd className="col-span-2 font-medium">{request.title}</dd>
          </div>
          <div className="grid grid-cols-3">
            <dt className="text-gray-500">Ly do:</dt>
            <dd className="col-span-2">{request.reason}</dd>
          </div>
          <div className="grid grid-cols-3">
            <dt className="text-gray-500">Nguoi yeu cau:</dt>
            <dd className="col-span-2">
              {request.requester.name} - {request.requester.department}
            </dd>
          </div>
          {request.totalAmount && (
            <div className="grid grid-cols-3">
              <dt className="text-gray-500">Tong tien uoc tinh:</dt>
              <dd className="col-span-2 font-bold text-blue-700">
                {formatCurrency(request.totalAmount)}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* Danh sach items voi trang thai PO */}
      {request.items.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-bold mb-3">
            Danh sach mat hang ({request.items.length})
          </h3>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-2">Trang thai</th>
                <th className="text-left p-2">San pham</th>
                <th className="text-center p-2">SL</th>
                <th className="text-right p-2">Don gia</th>
                <th className="text-right p-2">Thanh tien</th>
                <th className="text-left p-2">PO</th>
              </tr>
            </thead>
            <tbody>
              {request.items.map((item) => {
                const po = itemPOs.get(item.id);
                const itemName = item.deviceModel
                  ? item.deviceModel.brand + " - " + item.deviceModel.name
                  : item.customName;
                return (
                  <tr key={item.id} className="border-t">
                    <td className="p-2">
                      {po ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <X className="w-5 h-5 text-red-400" />
                      )}
                    </td>
                    <td className="p-2">
                      <p className="font-medium">{itemName}</p>
                      <p className="text-xs text-gray-500">
                        {item.category.name}
                        {item.specs ? " - " + item.specs : ""}
                      </p>
                    </td>
                    <td className="p-2 text-center">{item.quantity}</td>
                    <td className="p-2 text-right">
                      {formatCurrency(item.unitPrice || 0)}
                    </td>
                    <td className="p-2 text-right font-medium">
                      {formatCurrency(item.totalPrice || 0)}
                    </td>
                    <td className="p-2">
                      {po ? (
                        <Link
                          href={\`/purchase-orders/\${po.id}\`}
                          className="text-xs text-blue-600 hover:underline font-mono\`}
                        >
                          {po.poNumber}
                        </Link>
                      ) : (
                        <span className="text-xs text-gray-400">Chua co</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Danh sach PO lien quan */}
      {request.purchaseOrders.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-bold mb-3">PO lien quan ({request.purchaseOrders.length})</h3>
          <div className="space-y-2">
            {request.purchaseOrders.map((pr) => (
              <Link
                key={pr.id}
                href={\`/purchase-orders/\${pr.purchaseOrder.id}\`}
                className="flex justify-between items-center p-2 border rounded hover:bg-gray-50\`}
              >
                <span className="font-mono text-sm">{pr.purchaseOrder.poNumber}</span>
                <span className={\`text-xs px-2 py-1 rounded \${getStatusColor(pr.purchaseOrder.status)}\`}>
                  {getStatusLabel(pr.purchaseOrder.status)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Lich su phe duyet */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-bold mb-3">Lich su phe duyet</h3>
        <div className="space-y-3">
          {request.approvalSteps.map((step) => (
            <div key={step.id} className="flex gap-3">
              <div>
                {step.decision === "APPROVED" ? (
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                ) : step.decision === "REJECTED" ? (
                  <XCircle className="w-6 h-6 text-red-500" />
                ) : (
                  <Clock className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <div>
                <p className="font-medium text-sm">
                  Buoc {step.stepNumber}:{" "}
                  {step.stepNumber === 1
                    ? "Quan ly"
                    : step.stepNumber === 2
                    ? "IT"
                    : "Mua sam"}
                </p>
                <p className="text-xs text-gray-500">{step.approver.name}</p>
                {step.comment && (
                  <p className="text-xs bg-gray-50 p-2 rounded mt-1 italic">
                    "{step.comment}"
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
`;

const file = path.join(__dirname, "src", "app", "(dashboard)", "requests", "[id]", "page.tsx");
fs.writeFileSync(file, code);
console.log("Created:", file);