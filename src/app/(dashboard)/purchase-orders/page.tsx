import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ShoppingCart, Package, FileText } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function PurchaseOrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const purchaseOrders = await prisma.purchaseOrder.findMany({
    include: {
      requests: {
        include: {
          request: {
            include: {
              requester: { select: { name: true, department: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const statusLabels: Record<string, { label: string; color: string }> = {
    DRAFT: { label: "Nhap", color: "bg-gray-100 text-gray-700" },
    SENT: { label: "Da gui", color: "bg-blue-100 text-blue-700" },
    SHIPPED: { label: "Dang giao", color: "bg-yellow-100 text-yellow-700" },
    DELIVERED: { label: "Da nhan", color: "bg-green-100 text-green-700" },
    CANCELLED: { label: "Huy", color: "bg-red-100 text-red-700" },
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Don mua hang (PO)</h1>
          <p className="text-gray-500 mt-1">{purchaseOrders.length} don</p>
        </div>
        {(session.user.role === "PURCHASING" || session.user.role === "ADMIN") && (
          <div className="flex gap-2">
            <Link
              href="/purchase-orders/pending"
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 flex items-center gap-2"
            >
              <Package className="w-4 h-4" />
              YC cho mua
            </Link>
            <Link
              href="/purchase-orders/select-items"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Tao PO tu YC
            </Link>
          </div>
        )}
      </div>

      {purchaseOrders.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow text-center text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Chua co don mua hang nao</p>
          <p className="text-xs mt-2">
            Vao "YC cho mua" de tao PO tu cac yeu cau da duyet
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {purchaseOrders.map((po) => {
            const status = statusLabels[po.status] || statusLabels.DRAFT;
            return (
              <div key={po.id} className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-lg">{po.poNumber}</p>
                      <span className={`text-xs px-2 py-0.5 rounded ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      NCC: <strong>{po.supplierName}</strong>
                      {po.supplierContact && " - " + po.supplierContact}
                    </p>
                    <p className="text-sm font-medium mt-2">
                      Tong tien: <span className="text-blue-700">{formatCurrency(po.totalAmount)}</span>
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <div className="text-gray-500">Ngay dat</div>
                    <div className="font-medium">{formatDate(po.orderDate)}</div>
                    {po.expectedDate && (
                      <>
                        <div className="text-gray-500 mt-2">Du kien giao</div>
                        <div className="font-medium text-blue-600">
                          {formatDate(po.expectedDate)}
                        </div>
                      </>
                    )}
                    {po.actualDate && (
                      <>
                        <div className="text-gray-500 mt-2">Nhan thuc te</div>
                        <div className="font-medium text-green-600">
                          {formatDate(po.actualDate)}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs font-medium text-gray-600 mb-2">
                    Bao gom {po.requests.length} yeu cau:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {po.requests.map((pr) => (
                      <Link
                        key={pr.id}
                        href={`/requests/${pr.requestId}`}
                        className="text-xs bg-gray-100 hover:bg-gray-200 rounded px-2 py-1 flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3" />
                        {pr.request.requestNumber}
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t flex gap-2 flex-wrap items-center">
                  {po.poDocument && (
                    <a
                      href={po.poDocument}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Xem file PO
                    </a>
                  )}
                  {po.invoiceDocument && (
                    <a
                      href={po.invoiceDocument}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Xem hoa don
                    </a>
                  )}
                  {session.user.role === "IT_STAFF" && po.status !== "DELIVERED" && (
                    <Link
                      href={`/purchase-orders/${po.id}/receive`}
                      className="ml-auto px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      Xac nhan nhan hang
                    </Link>
                  )}
                  {po.status === "DELIVERED" && session.user.role === "IT_STAFF" && (
                    <span className="ml-auto px-3 py-1.5 bg-gray-100 text-gray-600 rounded text-sm">
                      Da nhan hang
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
