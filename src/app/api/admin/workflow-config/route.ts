import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getExchangeRateState, saveExchangeRateSettings } from "@/lib/exchange-rate";

const STEP_KEY = "LEAD_APPROVAL_THRESHOLD_USD";
const DEFAULT_THRESHOLD = 5000;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const config = await prisma.sLAConfig.findUnique({
    where: { stepName: STEP_KEY },
  });

  const fx = await getExchangeRateState({ refreshIfAuto: true });

  return NextResponse.json({
    leadThresholdUsd: config?.hoursToApprove ?? DEFAULT_THRESHOLD,
    exchangeRateMode: fx.mode,
    manualRateVndPerUsd: fx.manualVndPerUsd,
    autoRateVndPerUsd: fx.autoVndPerUsd,
    effectiveRateVndPerUsd: fx.effectiveVndPerUsd,
    lastAutoSyncEpoch: fx.lastAutoSyncEpoch,
  });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const nextThreshold = Number(body?.leadThresholdUsd);
    const nextMode = String(body?.exchangeRateMode || "MANUAL").toUpperCase();
    const nextManualRate = Number(body?.manualRateVndPerUsd);

    if (!Number.isFinite(nextThreshold) || nextThreshold < 0) {
      return NextResponse.json({ error: "Nguong khong hop le" }, { status: 400 });
    }
    if (nextMode !== "MANUAL" && nextMode !== "AUTO") {
      return NextResponse.json({ error: "Che do ty gia khong hop le" }, { status: 400 });
    }
    if (!Number.isFinite(nextManualRate) || nextManualRate <= 0) {
      return NextResponse.json({ error: "Ty gia manual khong hop le" }, { status: 400 });
    }

    const saved = await prisma.sLAConfig.upsert({
      where: { stepName: STEP_KEY },
      update: { hoursToApprove: Math.round(nextThreshold) },
      create: {
        stepName: STEP_KEY,
        hoursToApprove: Math.round(nextThreshold),
      },
    });

    await saveExchangeRateSettings({
      mode: nextMode,
      manualVndPerUsd: nextManualRate,
    });

    const fx = await getExchangeRateState({ refreshIfAuto: nextMode === "AUTO" });

    return NextResponse.json({
      leadThresholdUsd: saved.hoursToApprove,
      exchangeRateMode: fx.mode,
      manualRateVndPerUsd: fx.manualVndPerUsd,
      autoRateVndPerUsd: fx.autoVndPerUsd,
      effectiveRateVndPerUsd: fx.effectiveVndPerUsd,
      lastAutoSyncEpoch: fx.lastAutoSyncEpoch,
      success: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
