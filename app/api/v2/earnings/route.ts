import { NextResponse } from "next/server";
import { getUserSession } from "@/lib/next-auth/user-session";
import {
  listDownloadEarningsByUsername,
  listWithdrawRequestsByUsername,
} from "@/lib/supabase/db/earnings";

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
    const [earnings, withdrawals] = await Promise.all([
      listDownloadEarningsByUsername(userSession.username),
      listWithdrawRequestsByUsername(userSession.username),
    ]);

    const totalGross = earnings.reduce(
      (sum, item) => sum + (item.grossAmount || 0),
      0,
    );
    const totalFee = earnings.reduce(
      (sum, item) => sum + (item.feeAmount || 0),
      0,
    );
    const totalNet = earnings.reduce(
      (sum, item) => sum + (item.netAmount || 0),
      0,
    );

    const reserved = withdrawals
      .filter((item) => item.status !== "rejected")
      .reduce((sum, item) => sum + (item.amount || 0), 0);

    const availableBalance = Math.max(0, totalNet - reserved);

    return NextResponse.json({
      status: 200,
      message: "success",
      data: {
        totals: {
          gross: totalGross,
          fee: totalFee,
          net: totalNet,
          reserved,
          available: availableBalance,
        },
        minWithdrawAmount: 50000,
        earnings,
        withdrawals,
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
