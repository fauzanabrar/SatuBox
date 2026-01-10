import { NextRequest, NextResponse } from "next/server";
import { Buffer } from "buffer";
import { getUserSession } from "@/lib/next-auth/user-session";
import userServices from "@/services/userServices";
import {
  DEFAULT_PLAN_ID,
  PLANS,
  type BillingCycle,
  type PlanId,
} from "@/lib/billing/plans";

type VerifyRequest = {
  orderId?: string;
  planId?: PlanId;
  billingCycle?: BillingCycle;
};

const getMidtransBaseUrl = () =>
  process.env.MIDTRANS_ENV === "production"
    ? "https://api.midtrans.com"
    : "https://api.sandbox.midtrans.com";

const isPaymentSuccess = (data: any) => {
  if (!data) return false;
  if (data.transaction_status === "settlement") return true;
  if (data.transaction_status === "capture") {
    return !data.fraud_status || data.fraud_status === "accept";
  }
  return false;
};

const addBillingCycle = (date: Date, cycle: BillingCycle) => {
  const next = new Date(date);
  if (cycle === "annual") {
    next.setFullYear(next.getFullYear() + 1);
  } else {
    next.setMonth(next.getMonth() + 1);
  }
  return next;
};

const getPaymentDate = (value: unknown) => {
  if (!value) return new Date();
  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) return new Date();
  return parsed;
};

export async function POST(request: NextRequest) {
  const userSession = await getUserSession();
  if (!userSession?.username) {
    return NextResponse.json(
      {
        status: 401,
        message: "Unauthorized",
      },
      { status: 401 },
    );
  }

  const { orderId, planId, billingCycle } =
    (await request.json()) as VerifyRequest;

  if (!orderId) {
    return NextResponse.json(
      {
        status: 400,
        message: "orderId is required",
      },
      { status: 400 },
    );
  }

  if (!planId || !PLANS[planId]) {
    return NextResponse.json(
      {
        status: 400,
        message: "Invalid plan",
      },
      { status: 400 },
    );
  }

  if (planId === "free") {
    return NextResponse.json(
      {
        status: 400,
        message: "Free plan does not require verification",
      },
      { status: 400 },
    );
  }

  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) {
    return NextResponse.json(
      {
        status: 500,
        message: "MIDTRANS_SERVER_KEY is missing",
      },
      { status: 500 },
    );
  }

  const authHeader = Buffer.from(`${serverKey}:`).toString("base64");
  const baseUrl = getMidtransBaseUrl();

  try {
    const response = await fetch(`${baseUrl}/v2/${orderId}/status`, {
      headers: {
        Authorization: `Basic ${authHeader}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          status: response.status,
          message: data?.status_message || "Failed to verify payment",
        },
        { status: response.status },
      );
    }

    const expectedPlan = PLANS[planId];
    const expectedCycle =
      billingCycle === "annual" || billingCycle === "monthly"
        ? billingCycle
        : undefined;

    const grossAmount = Number(data.gross_amount);
    const userProfile = await userServices.ensureProfile(
      userSession.username,
    );
    const currentPlanId =
      (userProfile.planId as PlanId) ?? DEFAULT_PLAN_ID;
    const isUpgrade = currentPlanId === "starter" && planId === "pro";

    let resolvedCycle = expectedCycle;
    if (!resolvedCycle) {
      if (isUpgrade) {
        const monthlyUpgrade =
          PLANS.pro.monthlyPrice - PLANS.starter.monthlyPrice;
        const annualUpgrade =
          PLANS.pro.annualPrice - PLANS.starter.annualPrice;
        if (grossAmount === monthlyUpgrade) {
          resolvedCycle = "monthly";
        } else if (grossAmount === annualUpgrade) {
          resolvedCycle = "annual";
        }
      }

      if (!resolvedCycle) {
        if (grossAmount === expectedPlan.monthlyPrice) {
          resolvedCycle = "monthly";
        } else if (grossAmount === expectedPlan.annualPrice) {
          resolvedCycle = "annual";
        }
      }
    }

    if (!resolvedCycle) {
      return NextResponse.json(
        {
          status: 400,
          message: "Unable to resolve billing cycle from amount",
        },
        { status: 400 },
      );
    }

    const baseAmount =
      resolvedCycle === "annual"
        ? expectedPlan.annualPrice
        : expectedPlan.monthlyPrice;
    const upgradeCredit =
      resolvedCycle === "annual"
        ? PLANS.starter.annualPrice
        : PLANS.starter.monthlyPrice;
    const expectedAmount = isUpgrade
      ? Math.max(0, baseAmount - upgradeCredit)
      : baseAmount;

    if (!Number.isFinite(expectedAmount) || expectedAmount <= 0) {
      return NextResponse.json(
        {
          status: 400,
          message: "Invalid upgrade amount",
        },
        { status: 400 },
      );
    }

    if (
      Number.isFinite(grossAmount) &&
      Math.abs(grossAmount - expectedAmount) > 0.01
    ) {
      return NextResponse.json(
        {
          status: 400,
          message: "Payment amount does not match plan",
        },
        { status: 400 },
      );
    }

    if (!isPaymentSuccess(data)) {
      return NextResponse.json({
        status: 202,
        message: "Payment not completed",
        transaction_status: data.transaction_status,
        fraud_status: data.fraud_status,
      });
    }

    const paidAt = getPaymentDate(data.transaction_time);
    const nextBillingAt = addBillingCycle(paidAt, resolvedCycle);

    await userServices.updatePlan(
      userSession.username,
      planId,
      resolvedCycle,
      {
        lastPaymentAt: paidAt,
        lastPaymentAmount: grossAmount,
        lastPaymentOrderId: orderId,
        lastPaymentPlanId: planId,
        lastPaymentCycle: resolvedCycle,
        nextBillingAt,
      },
    );

    return NextResponse.json({
      status: 200,
      message: "Payment verified",
      transaction_status: data.transaction_status,
      fraud_status: data.fraud_status,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 500,
        message: "error",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
