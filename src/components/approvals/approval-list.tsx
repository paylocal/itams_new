"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, X, FileText, Clock } from "lucide-react";
import { getStatusColor, getStatusLabel, formatDate } from "@/lib/utils";

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
}

export function ApprovalList({ requests, userRole }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Yeu cau cho phe duyet</h1>
        <p className="text-gray-500 mt-1">{requests.length} yeu cau dang cho</p>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow text-center">
          <Check className="w-12 h-12 mx-auto text-green-500 mb-3" />
          <p className="text-gray-600">Khong co yeu cau nao dang cho</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <ApprovalCard key={req.id} request={req} userRole={userRole} />
          ))}
        </div>
      )}
    </div>
  );
}

function ApprovalCard({ request, userRole }: { request: Request; userRole: string }) {
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [comment, setComment] = useState("");
  const [showForm, setShowForm] = useState<"APPROVED" | "REJECTED" | null>(null);
  const [error, setError] = useState("");

  const handleDecision = async (decision: "APPROVED" | "REJECTED") => {
    if (decision === "REJECTED" && !comment.trim()) {
      setError("Vui long nhap ly do");
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
      const message = e instanceof Error ? e.message : "Unknown error";
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
            Nguoi yeu cau: <strong>{request.requester.name}</strong>
            {request.requester.department && ` (${request.requester.department})`}
          </p>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            <strong>Ly do:</strong> {request.reason}
          </p>
        </div>
        <div className="text-right text-xs text-gray-500">
          <Clock className="w-3 h-3 inline mr-1" />
          {formatDate(request.createdAt)}
        </div>
      </div>

      {showForm ? (
        <div className="mt-4 pt-3 border-t space-y-2">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={showForm === "REJECTED" ? "Ly do tu choi *" : "Ghi chu (tuy chon)"}
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
                ? "Dang xu ly..."
                : `Xac nhan ${showForm === "APPROVED" ? "phe duyet" : "tu choi"}`}
            </button>
            <button
              onClick={() => {
                setShowForm(null);
                setComment("");
                setError("");
              }}
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              Huy
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2 pt-3 border-t flex-wrap">
          {userRole === "PURCHASING" && request.status === "ORDERED" && (
            <Link
              href={`/purchase-orders/new?requestIds=${request.id}`}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
            >
              Tao PO
            </Link>
          )}
          <button
            onClick={() => setShowForm("APPROVED")}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-1"
          >
            <Check className="w-4 h-4" /> Phe duyet
          </button>
          <button
            onClick={() => setShowForm("REJECTED")}
            className="px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 flex items-center gap-1"
          >
            <X className="w-4 h-4" /> Tu choi
          </button>
          <Link
            href={`/requests/${request.id}`}
            className="ml-auto px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-md flex items-center gap-1"
          >
            <FileText className="w-4 h-4" /> Xem chi tiet
          </Link>
        </div>
      )}
    </div>
  );
}