import { NextRequest, NextResponse } from "next/server";
import { getUserSession } from "@/lib/next-auth/user-session";
import userServices from "@/services/userServices";
import { DEFAULT_PLAN_ID, PLANS, PLAN_ORDER } from "@/lib/billing/plans";

export async function GET() {
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

  try {
    const billingStatus = await userServices.resolveBillingStatus(
      userSession.username,
    );
    const userProfile = billingStatus.profile;
    const planId = (userProfile.planId as keyof typeof PLANS) ?? DEFAULT_PLAN_ID;
    const plan = PLANS[planId] ?? PLANS[DEFAULT_PLAN_ID];

    return NextResponse.json({
      status: 200,
      message: "success",
      data: {
        planId: plan.id,
        billingCycle: userProfile.billingCycle ?? null,
        storageLimitBytes:
          userProfile.storageLimitBytes ?? plan.storageLimitBytes,
        storageUsedBytes: userProfile.storageUsedBytes ?? 0,
        lastPaymentAt: userProfile.lastPaymentAt ?? null,
        lastPaymentAmount: userProfile.lastPaymentAmount ?? null,
        lastPaymentOrderId: userProfile.lastPaymentOrderId ?? null,
        lastPaymentPlanId: userProfile.lastPaymentPlanId ?? null,
        lastPaymentCycle: userProfile.lastPaymentCycle ?? null,
        nextBillingAt: userProfile.nextBillingAt ?? null,
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

  const { planId, billingCycle } = await request.json();
  const nextPlanId = planId as keyof typeof PLANS;

  if (!nextPlanId || !PLANS[nextPlanId]) {
    return NextResponse.json(
      {
        status: 400,
        message: "Invalid plan",
      },
      { status: 400 },
    );
  }

  const isCycleValid =
    billingCycle === "monthly" || billingCycle === "annual";
  const nextBillingCycle =
    nextPlanId === "free" ? null : isCycleValid ? billingCycle : null;

  try {
    const userProfile = await userServices.ensureProfile(
      userSession.username,
    );
    const currentPlanId =
      (userProfile.planId as keyof typeof PLANS) ?? DEFAULT_PLAN_ID;

    if (userSession.role !== "admin") {
      const currentRank = PLAN_ORDER.indexOf(currentPlanId);
      const nextRank = PLAN_ORDER.indexOf(nextPlanId);

      if (nextRank < currentRank) {
        return NextResponse.json(
          {
            status: 403,
            message: "Plan downgrade is not allowed",
          },
          { status: 403 },
        );
      }
    }

    const plan = await userServices.updatePlan(
      userSession.username,
      nextPlanId,
      nextBillingCycle,
    );

    return NextResponse.json({
      status: 200,
      message: "success",
      data: {
        planId: plan.id,
        billingCycle: nextBillingCycle,
        storageLimitBytes: plan.storageLimitBytes,
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
