import { NextRequest, NextResponse } from "next/server";
import { Buffer } from "buffer";
import { getUserSession } from "@/lib/next-auth/user-session";
import { PLANS, type BillingCycle, type PlanId } from "@/lib/billing/plans";

type CreateRequest = {
  planId?: PlanId;
  billingCycle?: BillingCycle;
};

const getMidtransSnapUrl = () =>
  process.env.MIDTRANS_ENV === "production"
    ? "https://app.midtrans.com/snap/v1/transactions"
    : "https://app.sandbox.midtrans.com/snap/v1/transactions";

const sanitizeOrderId = (value: string) =>
  value.replace(/[^a-zA-Z0-9-_]/g, "-");

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

  const { planId, billingCycle } = (await request.json()) as CreateRequest;

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
        message: "Free plan does not require payment",
      },
      { status: 400 },
    );
  }

  if (billingCycle !== "monthly" && billingCycle !== "annual") {
    return NextResponse.json(
      {
        status: 400,
        message: "Invalid billing cycle",
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

  const plan = PLANS[planId];
  const grossAmount =
    billingCycle === "annual" ? plan.annualPrice : plan.monthlyPrice;

  const orderId = sanitizeOrderId(
    `order-${userSession.username}-${Date.now()}`,
  );

  const body = {
    transaction_details: {
      order_id: orderId,
      gross_amount: grossAmount,
    },
    item_details: [
      {
        id: `${planId}-${billingCycle}`,
        price: grossAmount,
        quantity: 1,
        name: `${plan.name} (${billingCycle})`,
      },
    ],
    customer_details: {
      first_name: userSession.name || userSession.username,
    },
    custom_field1: planId,
    custom_field2: billingCycle,
  };

  const authHeader = Buffer.from(`${serverKey}:`).toString("base64");

  try {
    const response = await fetch(getMidtransSnapUrl(), {
      method: "POST",
      headers: {
        Authorization: `Basic ${authHeader}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          status: response.status,
          message: data?.status_message || "Failed to create transaction",
        },
        { status: response.status },
      );
    }

    return NextResponse.json({
      status: 200,
      message: "success",
      data: {
        snapToken: data.token,
        redirectUrl: data.redirect_url,
        orderId,
      },
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
