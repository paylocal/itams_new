"use client";

import { useEffect, useState } from "react";
import { useI18n } from "../i18n-provider";

type WorkflowConfigProps = {
  embedded?: boolean;
};

export function WorkflowConfig({ embedded = false }: WorkflowConfigProps) {
  const { t } = useI18n();
  const [threshold, setThreshold] = useState(5000);
  const [exchangeRateMode, setExchangeRateMode] = useState<"AUTO" | "MANUAL">("MANUAL");
  const [manualRate, setManualRate] = useState(26000);
  const [autoRate, setAutoRate] = useState<number | null>(null);
  const [effectiveRate, setEffectiveRate] = useState(26000);
  const [lastAutoSyncEpoch, setLastAutoSyncEpoch] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadConfig();
  }, []);

  async function loadConfig() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/workflow-config", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("workflow.loadError", "Cannot load config"));
      } else {
        setThreshold(Number(data.leadThresholdUsd || 5000));
        setExchangeRateMode(data.exchangeRateMode === "AUTO" ? "AUTO" : "MANUAL");
        setManualRate(Number(data.manualRateVndPerUsd || 26000));
        setAutoRate(
          data.autoRateVndPerUsd === null || data.autoRateVndPerUsd === undefined
            ? null
            : Number(data.autoRateVndPerUsd)
        );
        setEffectiveRate(Number(data.effectiveRateVndPerUsd || data.manualRateVndPerUsd || 26000));
        setLastAutoSyncEpoch(
          data.lastAutoSyncEpoch === null || data.lastAutoSyncEpoch === undefined
            ? null
            : Number(data.lastAutoSyncEpoch)
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t("workflow.loadError", "Cannot load config"));
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/admin/workflow-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadThresholdUsd: threshold,
          exchangeRateMode,
          manualRateVndPerUsd: manualRate,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("workflow.saveError", "Save config failed"));
      } else {
        setThreshold(Number(data.leadThresholdUsd || threshold));
        setExchangeRateMode(data.exchangeRateMode === "AUTO" ? "AUTO" : exchangeRateMode);
        setManualRate(Number(data.manualRateVndPerUsd || manualRate));
        setAutoRate(
          data.autoRateVndPerUsd === null || data.autoRateVndPerUsd === undefined
            ? null
            : Number(data.autoRateVndPerUsd)
        );
        setEffectiveRate(Number(data.effectiveRateVndPerUsd || effectiveRate));
        setLastAutoSyncEpoch(
          data.lastAutoSyncEpoch === null || data.lastAutoSyncEpoch === undefined
            ? null
            : Number(data.lastAutoSyncEpoch)
        );
        setMessage(t("workflow.saved", "Saved workflow config and exchange rate"));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t("workflow.saveError", "Save config failed"));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className={embedded ? "p-4 border rounded-lg bg-gray-50" : "p-6 bg-white rounded-lg shadow"}>
        {t("common.loading", "Loading...")}
      </div>
    );
  }

  const wrapperClass = embedded ? "border rounded-lg p-4 bg-gray-50 space-y-4" : "bg-white p-6 rounded-lg shadow space-y-4";

  return (
    <div className="space-y-4">
      {!embedded && (
        <div>
          <h1 className="text-2xl font-bold">{t("nav.workflow", "Workflow Approvals")}</h1>
          <p className="text-gray-500 mt-1">{t("workflow.subtitle", "Configure thresholds for Lead approval step")}</p>
        </div>
      )}

      <div className={wrapperClass}>
        <div>
          <label className="block text-sm font-medium mb-2">{t("workflow.rateMode", "Exchange rate mode (VND/USD)")}</label>
          <select
            value={exchangeRateMode}
            onChange={(e) => setExchangeRateMode(e.target.value === "AUTO" ? "AUTO" : "MANUAL")}
            className="w-full md:w-80 border rounded px-3 py-2"
          >
            <option value="MANUAL">Manual</option>
            <option value="AUTO">{t("workflow.autoRate", "Auto (fetch online rate)")}</option>
          </select>

          <div className="mt-3">
            <label className="block text-sm font-medium mb-2">{t("workflow.manualRate", "Manual rate (VND per 1 USD)")}</label>
            <input
              type="number"
              min={1}
              value={manualRate}
              onChange={(e) => setManualRate(Number(e.target.value || 0))}
              disabled={saving}
              className="w-full md:w-80 border rounded px-3 py-2"
            />
          </div>

          <div className="mt-3 text-sm text-gray-600 space-y-1">
            <p>{t("workflow.autoRateValue", "Current auto rate")}: {autoRate ? `${autoRate.toLocaleString("vi-VN")} VND/USD` : t("workflow.rateUnavailable", "Unavailable")}</p>
            <p>{t("workflow.effectiveRate", "Effective rate")}: {Number(effectiveRate || 0).toLocaleString("vi-VN")} VND/USD</p>
            {lastAutoSyncEpoch ? (
              <p>
                {t("workflow.lastSync", "Last auto sync")}: {new Date(lastAutoSyncEpoch * 1000).toLocaleString("vi-VN")}
              </p>
            ) : (
              <p>{t("workflow.lastSync", "Last auto sync")}: {t("workflow.noSync", "Not yet")}</p>
            )}
          </div>
        </div>

        {error && <div className="bg-red-50 text-red-700 p-2 rounded text-sm">{error}</div>}
        {message && <div className="bg-green-50 text-green-700 p-2 rounded text-sm">{message}</div>}

        <button
          onClick={save}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? t("common.saving", "Saving...") : t("workflow.save", "Save config")}
        </button>
      </div>
    </div>
  );
}
