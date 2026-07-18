"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, Eraser, Download, ArrowLeft, FileText } from "lucide-react";
import { useI18n } from "../i18n-provider";

type HandoverDetailData = {
  id: string;
  handoverNumber: string;
  status: string;
  handoverDate: Date | string;
  employeeId: string;
  employee: { name: string; department?: string | null };
  itStaff: { name: string };
  items: Array<{
    id: string;
    asset: { assetTag: string; name: string; serialNumber?: string | null };
  }>;
  employeeSignature?: string | null;
  employeeSignedAt?: Date | string | null;
  itSignature?: string | null;
  itSignedAt?: Date | string | null;
};

interface Props {
  handover: HandoverDetailData;
  currentUserId: string;
  currentUserRole: string;
}

export function HandoverDetail({ handover, currentUserId, currentUserRole }: Props) {
  const router = useRouter();
  const { locale, t } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Xac dinh quyen ky
  const canSignAsEmployee =
    handover.status === "PENDING_EMPLOYEE_SIGN" &&
    handover.employeeId === currentUserId &&
    !handover.employeeSignature;

  const canSignAsIT =
    handover.status === "PENDING_IT_SIGN" &&
    (currentUserRole === "IT_STAFF" || currentUserRole === "ADMIN") &&
    !handover.itSignature;

  const isCompleted = handover.status === "COMPLETED";

  // Khoi tao canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#000";
    }
  }, []);

  const getPos = (
    e: React.MouseEvent | React.TouchEvent,
    canvas: HTMLCanvasElement
  ) => {
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canSignAsEmployee && !canSignAsIT) return;
    setIsDrawing(true);
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const { x, y } = getPos(e, canvas);
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const { x, y } = getPos(e, canvas);
      ctx.lineTo(x, y);
      ctx.stroke();
      setHasSignature(true);
    }
  };

  const stopDraw = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasSignature(false);
    }
  };

  const handleSign = async () => {
    if (!hasSignature) {
      setError(t("common.please.sign.first", "Please sign first"));
      return;
    }
    setLoading(true);
    setError("");

    try {
      const signature = canvasRef.current!.toDataURL("image/png");
      const role = canSignAsEmployee ? "EMPLOYEE" : "IT";

      const res = await fetch(`/api/handover/${handover.id}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signature, role }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
      } else {
        alert(t("common.signed.successfully", "Signed successfully!"));
        router.refresh();
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const statusText =
    handover.status === "PENDING_EMPLOYEE_SIGN"
      ? t("common.pending.employee", "Pending Employee")
      : handover.status === "PENDING_IT_SIGN"
      ? t("common.pending.it", "Pending IT")
      : t("common.completed", "Completed");

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <button
        onClick={() => router.back()}
        className="text-sm text-gray-600 hover:underline flex items-center gap-1"
      >
        <ArrowLeft className="w-4 h-4" /> {t("common.back", "Back")}
      </button>

      <div>
        <h1 className="text-2xl font-bold">
          {t("common.handover.agreement", "Handover Agreement")}
        </h1>
        <p className="text-gray-500 font-mono text-sm mt-1">{handover.handoverNumber}</p>
        <span className="inline-block mt-2 px-2 py-1 rounded text-xs bg-blue-100 text-blue-700">
          {statusText}
        </span>
      </div>

      {/* Thong tin */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="font-bold mb-3 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          {t("common.information", "Information")}
        </h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-500">{t("common.receiver", "Receiver")}</p>
            <p className="font-medium">{handover.employee.name}</p>
            <p className="text-xs text-gray-500">{handover.employee.department}</p>
          </div>
          <div>
            <p className="text-gray-500">{t("common.it.staff", "IT Staff")}</p>
            <p className="font-medium">{handover.itStaff.name}</p>
          </div>
          <div>
            <p className="text-gray-500">{t("common.date", "Date")}</p>
            <p className="font-medium">
              {new Date(handover.handoverDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-gray-500">{t("common.total.items", "Total items")}</p>
            <p className="font-medium">{handover.items.length}</p>
          </div>
        </div>
      </div>

      {/* Danh sach tai san */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="font-bold mb-3">
          {t("common.asset.list", "Asset List")} ({handover.items.length})
        </h2>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">{t("common.tag", "Tag")}</th>
              <th className="text-left p-2">{t("common.name", "Name")}</th>
              <th className="text-left p-2">Serial</th>
            </tr>
          </thead>
          <tbody>
            {handover.items.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="p-2 font-mono text-xs">{item.asset.assetTag}</td>
                <td className="p-2">{item.asset.name}</td>
                <td className="p-2 text-xs text-gray-500">
                  {item.asset.serialNumber || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phan ky */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Chu ky NV */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-bold mb-2 flex items-center justify-between">
            <span>{t("common.employee.signature", "Employee Signature")}</span>
            {handover.employeeSignature && <Check className="w-5 h-5 text-green-500" />}
          </h3>
          {handover.employeeSignature ? (
            <img
              src={handover.employeeSignature}
              alt="Employee signature"
              className="border rounded w-full h-32 object-contain bg-white"
            />
          ) : canSignAsEmployee ? (
            <div className="space-y-2">
              <canvas
                ref={canvasRef}
                className="w-full h-32 border-2 border-dashed rounded cursor-crosshair touch-none bg-white"
                width={400}
                height={128}
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={stopDraw}
                onMouseLeave={stopDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={stopDraw}
              />
              <div className="flex gap-2">
                <button
                  onClick={clearCanvas}
                  className="px-3 py-1.5 border rounded text-sm hover:bg-gray-50 flex items-center gap-1"
                >
                  <Eraser className="w-3 h-3" /> {t("common.clear", "Clear")}
                </button>
                <button
                  onClick={handleSign}
                  disabled={loading}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
                >
                  <Check className="w-3 h-3" />{" "}
                  {loading
                    ? t("handover.signing", "Signing...")
                    : t("handover.saveSignature", "Save Signature")}
                </button>
              </div>
            </div>
          ) : (
            <div className="h-32 border-2 border-dashed rounded flex items-center justify-center text-gray-400 text-sm">
              {handover.employeeId === currentUserId
                ? t("common.pending.employee2", "Pending Employee")
                : t("common.pending.employee3", "Pending Employee")}
            </div>
          )}
          {handover.employeeSignedAt && (
            <p className="text-xs text-gray-500 mt-1">
              {t("common.signed.at", "Signed at")}:{" "}
              {new Date(handover.employeeSignedAt).toLocaleString()}
            </p>
          )}
        </div>

        {/* Chu ky IT */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-bold mb-2 flex items-center justify-between">
            <span>{t("common.it.signature", "IT Signature")}</span>
            {handover.itSignature && <Check className="w-5 h-5 text-green-500" />}
          </h3>
          {handover.itSignature ? (
            <img
              src={handover.itSignature}
              alt="IT signature"
              className="border rounded w-full h-32 object-contain bg-white"
            />
          ) : canSignAsIT ? (
            <div className="space-y-2">
              <canvas
                ref={canvasRef}
                className="w-full h-32 border-2 border-dashed rounded cursor-crosshair touch-none bg-white"
                width={400}
                height={128}
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={stopDraw}
                onMouseLeave={stopDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={stopDraw}
              />
              <div className="flex gap-2">
                <button
                  onClick={clearCanvas}
                  className="px-3 py-1.5 border rounded text-sm hover:bg-gray-50 flex items-center gap-1"
                >
                  <Eraser className="w-3 h-3" /> {t("common.clear2", "Clear")}
                </button>
                <button
                  onClick={handleSign}
                  disabled={loading}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
                >
                  <Check className="w-3 h-3" />{" "}
                  {loading
                    ? t("handover.signing", "Signing...")
                    : t("handover.saveSignature", "Save Signature")}
                </button>
              </div>
            </div>
          ) : (
            <div className="h-32 border-2 border-dashed rounded flex items-center justify-center text-gray-400 text-sm">
              {!handover.employeeSignature
                ? t("common.pending.employee.first", "Pending Employee first")
                : t("common.pending.it2", "Pending IT")}
            </div>
          )}
          {handover.itSignedAt && (
            <p className="text-xs text-gray-500 mt-1">
              {t("common.signed.at2", "Signed at")}:{" "}
              {new Date(handover.itSignedAt).toLocaleString()}
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded text-sm">{error}</div>
      )}

      {isCompleted && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <Check className="w-8 h-8 mx-auto text-green-500 mb-2" />
          <p className="font-medium text-green-700">
            {t("common.handover.completed", "Handover completed")}
          </p>
        </div>
      )}
    </div>
  );
}
