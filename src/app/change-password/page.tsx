"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ChangePasswordPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  const mustChangePassword = (session?.user as any)?.mustChangePassword;
  const sessionLoading = status === "loading";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setErrors([]);

    try {
      const body: any = { newPassword, confirmPassword };
      if (!mustChangePassword) {
        body.currentPassword = currentPassword;
      }

      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrors(data.errors || [data.error || "Co loi xay ra"]);
        return;
      }

      setMessage("Doi mat khau thanh cong. Dang chuyen huong...");
      await update();
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setErrors([err.message || "Co loi xay ra"]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-2">
          {mustChangePassword ? "Yeu cau doi mat khau" : "Doi mat khau"}
        </h1>
        <p className="text-gray-600 text-center mb-6">
          {mustChangePassword
            ? "Vi ly do bao mat, ban can doi mat khau truoc khi tiep tuc su dung he thong."
            : "Cap nhat mat khau tai khoan cua ban."}
        </p>

        {message && (
          <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">{message}</div>
        )}
        {errors.length > 0 && (
          <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">
            {errors.map((err, i) => (
              <div key={i}>{err}</div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!mustChangePassword && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mat khau hien tai</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mat khau moi</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Xac nhan mat khau moi</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || sessionLoading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading || sessionLoading ? "Dang xu ly..." : "Doi mat khau"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Dang xuat
          </button>
        </div>
      </div>
    </div>
  );
}
