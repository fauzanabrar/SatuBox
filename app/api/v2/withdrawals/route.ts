import { NextRequest, NextResponse } from "next/server";
import { getUserSession } from "@/lib/next-auth/user-session";
import {
  createWithdrawRequest,
  listDownloadEarningsByUsername,
  listWithdrawRequestsByUsername,
  listWithdrawRequests,
  updateWithdrawRequestStatus,
} from "@/lib/firebase/db/earnings";

const MIN_WITHDRAW_AMOUNT = 50000;

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
    const isAdmin = userSession.role === "admin";
    const withdrawals = isAdmin
      ? await listWithdrawRequests()
      : await listWithdrawRequestsByUsername(userSession.username);
    return NextResponse.json({
      status: 200,
      message: "success",
      data: withdrawals,
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

  const {
    amount,
    methodType,
    provider,
    accountName,
    accountNumber,
  } =
    await request.json();

  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return NextResponse.json(
      {
        status: 400,
        message: "Amount must be greater than zero",
      },
      { status: 400 },
    );
  }
  if (!Number.isInteger(numericAmount)) {
    return NextResponse.json(
      {
        status: 400,
        message: "Amount must be a whole number (IDR)",
      },
      { status: 400 },
    );
  }
  if (numericAmount < MIN_WITHDRAW_AMOUNT) {
    return NextResponse.json(
      {
        status: 400,
        message: "Minimum withdrawal is 50000 IDR",
      },
      { status: 400 },
    );
  }

  if (!accountName || !accountNumber || !provider) {
    return NextResponse.json(
      {
        status: 400,
        message: "Provider, account name, and account number are required",
      },
      { status: 400 },
    );
  }
  if (methodType !== "bank" && methodType !== "ewallet") {
    return NextResponse.json(
      {
        status: 400,
        message: "Invalid withdrawal method",
      },
      { status: 400 },
    );
  }

  try {
    const [earnings, withdrawals] = await Promise.all([
      listDownloadEarningsByUsername(userSession.username),
      listWithdrawRequestsByUsername(userSession.username),
    ]);

    const totalNet = earnings.reduce(
      (sum, item) => sum + (item.netAmount || 0),
      0,
    );
    const reserved = withdrawals
      .filter((item) => item.status !== "rejected")
      .reduce((sum, item) => sum + (item.amount || 0), 0);
    const available = Math.max(0, totalNet - reserved);

    if (numericAmount > available) {
      return NextResponse.json(
        {
          status: 400,
          message: "Insufficient balance",
        },
        { status: 400 },
      );
    }

    await createWithdrawRequest({
      username: userSession.username,
      amount: numericAmount,
      status: "pending",
      method: methodType,
      bankName: provider,
      provider,
      accountName,
      accountNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      status: 201,
      message: "success",
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

export async function PATCH(request: NextRequest) {
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
  if (userSession.role !== "admin") {
    return NextResponse.json(
      {
        status: 403,
        message: "Forbidden",
      },
      { status: 403 },
    );
  }

  const { id, status } = await request.json();
  if (!id || !status) {
    return NextResponse.json(
      {
        status: 400,
        message: "id and status are required",
      },
      { status: 400 },
    );
  }

  if (
    status !== "pending" &&
    status !== "approved" &&
    status !== "paid" &&
    status !== "rejected"
  ) {
    return NextResponse.json(
      {
        status: 400,
        message: "Invalid status",
      },
      { status: 400 },
    );
  }

  try {
    await updateWithdrawRequestStatus(id, status);
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
      { status: 500 },
    );
  }
}
