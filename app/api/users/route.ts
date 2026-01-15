import { getUserSession } from "@/lib/next-auth/user-session";
import userServices from "@/services/userServices";
import { PLANS } from "@/lib/billing/plans";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const users = await userServices.list();

    return NextResponse.json({
      status: 200,
      message: "success",
      users,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 500,
        message: "error",
        error: error.message,
      },
      {
        status: 500,
      },
    );
  }
}

export async function PUT(request: NextRequest) {
  const {
    username,
    oldUsername,
    name,
    role,
    planId,
    billingCycle,
    nextBillingAt,
  } = await request.json();

  if (!oldUsername || !role) {
    return NextResponse.json(
      {
        status: 400,
        message: "Bad Request! oldUsername and Role is required!",
      },
      {
        status: 400,
      },
    );
  }

  // get user session
  const userSession = await getUserSession();

  if (!userSession) {
    return NextResponse.json(
      {
        status: 401,
        message: "Unauthorized",
      },
      {
        status: 401,
      },
    );
  }

  const hasPlanUpdate = Boolean(planId);
  const hasBillingDateUpdate = typeof nextBillingAt !== "undefined";
  if ((hasPlanUpdate || hasBillingDateUpdate) && userSession.role !== "admin") {
    return NextResponse.json(
      {
        status: 403,
        message: "Forbidden",
      },
      {
        status: 403,
      },
    );
  }

  try {
    const parsedNextBillingAt =
      typeof nextBillingAt === "string"
        ? nextBillingAt.trim() === ""
          ? null
          : new Date(nextBillingAt)
        : nextBillingAt === null
          ? null
          : undefined;
    if (
      parsedNextBillingAt instanceof Date &&
      Number.isNaN(parsedNextBillingAt.getTime())
    ) {
      return NextResponse.json(
        {
          status: 400,
          message: "Invalid paid until date",
        },
        {
          status: 400,
        },
      );
    }
    const billingUpdates =
      typeof parsedNextBillingAt === "undefined"
        ? {}
        : { nextBillingAt: parsedNextBillingAt };

    if (hasPlanUpdate) {
      const nextPlanId = planId as keyof typeof PLANS;
      if (!PLANS[nextPlanId]) {
        return NextResponse.json(
          {
            status: 400,
            message: "Invalid plan",
          },
          {
            status: 400,
          },
        );
      }

      const nextCycle =
        nextPlanId === "free"
          ? null
          : billingCycle === "monthly" || billingCycle === "annual"
            ? billingCycle
            : null;

      await userServices.updatePlan(
        oldUsername,
        nextPlanId,
        nextCycle,
        billingUpdates,
      );
    } else if (Object.keys(billingUpdates).length > 0) {
      await userServices.updateBillingMeta(oldUsername, billingUpdates);
    }

    if (userSession.role === "admin") {
      await userServices.resolveBillingStatus(oldUsername);
    }

    console.log('About to call userServices.update with:', {
      username: oldUsername,
      newUsername: username,
      name,
      role,
    }); // Debug log

    await userServices.update({
      username: oldUsername,
      newUsername: username,
      name,
      role,
    });

    console.log('userServices.update completed successfully'); // Debug log

    return NextResponse.json({
      status: 200,
      message: "success",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 500,
        message: "error",
        error: error.message,
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { username } = await request.json();

  if (!username) {
    return NextResponse.json(
      {
        status: 400,
        message: "Bad Request! Username is required!",
      },
      {
        status: 400,
      },
    );
  }

  // get user session
  const userSession = await getUserSession();

  if (!userSession) {
    return NextResponse.json(
      {
        status: 401,
        message: "Unauthorized",
      },
      {
        status: 401,
      },
    );
  }

  if (userSession.role !== "admin") {
    return NextResponse.json(
      {
        status: 403,
        message: "Forbidden",
      },
      {
        status: 403,
      },
    );
  }

  try {
    await userServices.remove(username);

    return NextResponse.json({
      status: 200,
      message: "success",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 500,
        message: "error",
        error: error.message,
      },
      {
        status: 500,
      },
    );
  }
}
