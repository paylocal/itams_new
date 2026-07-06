import { prisma } from "@/lib/prisma";

const FX_MODE_KEY = "USD_VND_EXCHANGE_MODE";
const FX_MANUAL_RATE_KEY = "USD_VND_MANUAL_RATE";
const FX_LAST_AUTO_RATE_KEY = "USD_VND_LAST_AUTO_RATE";
const FX_LAST_SYNC_EPOCH_KEY = "USD_VND_LAST_SYNC_EPOCH";

const DEFAULT_VND_PER_USD = 26000;

export type ExchangeRateMode = "AUTO" | "MANUAL";

export type ExchangeRateState = {
  mode: ExchangeRateMode;
  manualVndPerUsd: number;
  autoVndPerUsd: number | null;
  effectiveVndPerUsd: number;
  lastAutoSyncEpoch: number | null;
};

function normalizePositiveInt(value: number, fallback: number): number {
  if (!Number.isFinite(value) || value <= 0) return fallback;
  return Math.round(value);
}

async function readConfigInt(stepName: string, fallback: number): Promise<number> {
  const row = await prisma.sLAConfig.findUnique({ where: { stepName } });
  if (!row) return fallback;
  return Number.isFinite(row.hoursToApprove) ? row.hoursToApprove : fallback;
}

async function writeConfigInt(stepName: string, value: number) {
  await prisma.sLAConfig.upsert({
    where: { stepName },
    update: { hoursToApprove: value },
    create: { stepName, hoursToApprove: value },
  });
}

export async function fetchUsdVndRateFromApi(): Promise<number | null> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      result?: string;
      rates?: Record<string, unknown>;
    };

    const vnd = Number(data?.rates?.VND);
    if (data?.result !== "success" || !Number.isFinite(vnd) || vnd <= 0) {
      return null;
    }

    return Math.round(vnd);
  } catch {
    return null;
  }
}

export async function getExchangeRateState(options?: {
  refreshIfAuto?: boolean;
}): Promise<ExchangeRateState> {
  const modeRaw = await readConfigInt(FX_MODE_KEY, 0);
  const mode: ExchangeRateMode = modeRaw === 1 ? "AUTO" : "MANUAL";

  const manualVndPerUsd = normalizePositiveInt(
    await readConfigInt(FX_MANUAL_RATE_KEY, DEFAULT_VND_PER_USD),
    DEFAULT_VND_PER_USD
  );

  let autoVndPerUsd = normalizePositiveInt(await readConfigInt(FX_LAST_AUTO_RATE_KEY, 0), 0);
  if (autoVndPerUsd <= 0) autoVndPerUsd = 0;

  let lastAutoSyncEpoch = await readConfigInt(FX_LAST_SYNC_EPOCH_KEY, 0);
  if (!Number.isFinite(lastAutoSyncEpoch) || lastAutoSyncEpoch <= 0) {
    lastAutoSyncEpoch = 0;
  }

  if (mode === "AUTO" && options?.refreshIfAuto) {
    const fetched = await fetchUsdVndRateFromApi();
    if (fetched && fetched > 0) {
      const epoch = Math.floor(Date.now() / 1000);
      await Promise.all([
        writeConfigInt(FX_LAST_AUTO_RATE_KEY, fetched),
        writeConfigInt(FX_LAST_SYNC_EPOCH_KEY, epoch),
      ]);
      autoVndPerUsd = fetched;
      lastAutoSyncEpoch = epoch;
    }
  }

  const effectiveVndPerUsd =
    mode === "AUTO"
      ? autoVndPerUsd > 0
        ? autoVndPerUsd
        : manualVndPerUsd
      : manualVndPerUsd;

  return {
    mode,
    manualVndPerUsd,
    autoVndPerUsd: autoVndPerUsd > 0 ? autoVndPerUsd : null,
    effectiveVndPerUsd,
    lastAutoSyncEpoch: lastAutoSyncEpoch > 0 ? lastAutoSyncEpoch : null,
  };
}

export async function saveExchangeRateSettings(input: {
  mode: ExchangeRateMode;
  manualVndPerUsd: number;
}) {
  const normalizedManual = normalizePositiveInt(input.manualVndPerUsd, DEFAULT_VND_PER_USD);
  const modeValue = input.mode === "AUTO" ? 1 : 0;

  await Promise.all([
    writeConfigInt(FX_MODE_KEY, modeValue),
    writeConfigInt(FX_MANUAL_RATE_KEY, normalizedManual),
  ]);
}