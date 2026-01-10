import { NextRequest, NextResponse } from "next/server";
import { Buffer } from "buffer";
import { getUserSession } from "@/lib/next-auth/user-session";
import userServices from "@/services/userServices";
import { PLANS, type BillingCycle, type PlanId } from "@/lib/billing/plans";

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

    let resolvedCycle = expectedCycle;
    const grossAmount = Number(data.gross_amount);
    if (!resolvedCycle) {
      if (grossAmount === expectedPlan.monthlyPrice) {
        resolvedCycle = "monthly";
      } else if (grossAmount === expectedPlan.annualPrice) {
        resolvedCycle = "annual";
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

    const expectedAmount =
      resolvedCycle === "annual"
        ? expectedPlan.annualPrice
        : expectedPlan.monthlyPrice;

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

    await userServices.updatePlan(
      userSession.username,
      planId,
      resolvedCycle,
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
