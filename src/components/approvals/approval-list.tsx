"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, X, FileText, Clock } from "lucide-react";
import { getStatusColor, getStatusLabel, formatDate } from "@/lib/utils";
import { useI18n } from "@/components/i18n-provider";

interface Request {
  id: string;
  requestNumber: string;
  title: string;
  reason: string;
  status: string;
  createdAt: Date;
  requester: {
    id: string;
    name: string;
    department: string | null;
  };
}

interface Props {
  requests: Request[];
  userRole: string;
  readOnly?: boolean;
}

export function ApprovalList({ requests, userRole, readOnly }: Props) {
  const { t } = useI18n();
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{t("approvals.title", "Pending Approvals")}</h1>
        <p className="text-gray-500 mt-1">
          {requests.length} {t("approvals.count", "requests")}
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow text-center">
          <Check className="w-12 h-12 mx-auto text-green-500 mb-3" />
          <p className="text-gray-600">{t("approvals.empty", "No pending requests")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <ApprovalCard key={req.id} request={req} userRole={userRole} readOnly={readOnly} />
          ))}
        </div>
      )}
    </div>
  );
}

function ApprovalCard({
  request,
  userRole,
  readOnly,
}: {
  request: Request;
  userRole: string;
  readOnly?: boolean;
}) {
  const router = useRouter();
  const { t } = useI18n();
  const [processing, setProcessing] = useState(false);
  const [comment, setComment] = useState("");
  const [showForm, setShowForm] = useState<"APPROVED" | "REJECTED" | null>(null);
  const [error, setError] = useState("");

  const canApprove = !readOnly;

  const handleDecision = async (decision: "APPROVED" | "REJECTED") => {
    if (decision === "REJECTED" && !comment.trim()) {
      setError(t("approvals.rejectReasonRequired", "Please enter a reason"));
      return;
    }
    setProcessing(true);
    setError("");

    try {
      const res = await fetch(`/api/requests/${request.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, comment }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
      } else {
        router.refresh();
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : t("common.error", "Error");
      setError(message);
    } finally {
      setProcessing(false);
    }
  };

  const handleStockCheck = async (hasStock: boolean) => {
    if (!hasStock && !comment.trim()) {
      setError(t("approvals.rejectReasonRequired", "Please enter a reason"));
      return;
    }
    setProcessing(true);
    setError("");
    try {
      const res = await fetch(`/api/requests/${request.id}/stock-check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hasStock, comment }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
      } else {
        router.refresh();
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : t("common.error", "Error");
      setError(message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow border">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href={`/requests/${request.id}`} className="font-bold hover:underline">
              {request.requestNumber}
            </Link>
            <span className={`px-2 py-1 rounded text-xs ${getStatusColor(request.status)}`}>
              {getStatusLabel(request.status)}
            </span>
          </div>
          <h3 className="font-medium">{request.title}</h3>
          <p className="text-sm text-gray-600 mt-1">
            {t("approvals.requester", "Requester")}: <strong>{request.requester.name}</strong>
            {request.requester.department && ` (${request.requester.department})`}
          </p>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            <strong>{t("common.reason", "Reason")}:</strong> {request.reason}
          </p>
        </div>
        <div className="text-right text-xs text-gray-500">
          <Clock className="w-3 h-3 inline mr-1" />
          {formatDate(request.createdAt)}
        </div>
      </div>

      {request.status === "PENDING_STOCK_CHECK" ? (
        <div className="mt-4 pt-3 border-t space-y-2">
          <p className="text-sm text-gray-700">{t("approvals.stockCheckTitle", "IT stock check")}</p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t("approvals.stockCommentPlaceholder", "Comment / reason")}
            rows={2}
            className="w-full border rounded-md px-3 py-2 text-sm"
          />
          {error && <div className="bg-red-50 text-red-700 p-2 rounded text-xs">{error}</div>}
          <div className="flex gap-2">
            <button
              onClick={() => handleStockCheck(true)}
              disabled={processing}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
            >
              <Check className="w-4 h-4" /> {t("approvals.inStock", "In stock - Complete")}
            </button>
            <button
              onClick={() => handleStockCheck(false)}
              disabled={processing}
              className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 flex items-center gap-1"
            >
              <X className="w-4 h-4" /> {t("approvals.outOfStock", "Out of stock - Order")}
            </button>
          </div>
        </div>
      ) : showForm ? (
        <div className="mt-4 pt-3 border-t space-y-2">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={
              showForm === "REJECTED"
                ? t("approvals.rejectPlaceholder", "Rejection reason *")
                : t("approvals.commentPlaceholder", "Comment (optional)")
            }
            rows={3}
            className="w-full border rounded-md px-3 py-2 text-sm"
          />
          {error && <div className="bg-red-50 text-red-700 p-2 rounded text-xs">{error}</div>}
          <div className="flex gap-2">
            <button
              onClick={() => handleDecision(showForm)}
              disabled={processing}
              className={`px-4 py-2 text-white rounded disabled:opacity-50 ${
                showForm === "APPROVED"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {processing
                ? t("common.processing", "Processing...")
                : showForm === "APPROVED"
                ? t("approvals.confirmApprove", "Confirm approve")
                : t("approvals.confirmReject", "Confirm reject")}
            </button>
            <button
              onClick={() => {
                setShowForm(null);
                setComment("");
                setError("");
              }}
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              {t("common.cancel", "Cancel")}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2 pt-3 border-t flex-wrap">
          {canApprove && userRole === "PURCHASING" && request.status === "ORDERED" && (
            <Link
              href={`/purchase-orders/new?requestIds=${request.id}`}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
            >
              {t("po.create", "Create PO")}
            </Link>
          )}
          {canApprove && request.status !== "PENDING_STOCK_CHECK" && (
            <>
              <button
                onClick={() => setShowForm("APPROVED")}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-1"
              >
                <Check className="w-4 h-4" /> {t("common.approve", "Approve")}
              </button>
              <button
                onClick={() => setShowForm("REJECTED")}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 flex items-center gap-1"
              >
                <X className="w-4 h-4" /> {t("common.reject", "Reject")}
              </button>
            </>
          )}
          <Link
            href={`/requests/${request.id}`}
            className="ml-auto px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-md flex items-center gap-1"
          >
            <FileText className="w-4 h-4" /> {t("common.viewDetail", "View detail")}
          </Link>
        </div>
      )}
    </div>
  );
}
