import { NextRequest, NextResponse } from "next/server";
import { Buffer } from "buffer";
import crypto from "node:crypto";
import {
  createDownloadToken,
  getDownloadOrder,
  updateDownloadOrder,
  getPaidDownload,
} from "@/lib/supabase/db/paid-download";
import { getUserByUsername } from "@/lib/supabase/db/users";

import {
  createDownloadEarning,
} from "@/lib/supabase/db/earnings";

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
  const { orderId } = await request.json();

  if (!orderId) {
    return NextResponse.json(
      {
        status: 400,
        message: "orderId is required",
      },
      { status: 400 },
    );
  }

  const order = await getDownloadOrder(orderId);
  if (!order) {
    return NextResponse.json(
      {
        status: 404,
        message: "Order not found",
      },
      { status: 404 },
    );
  }

  if (order.status === "paid" && order.token) {
    return NextResponse.json({
      status: 200,
      message: "success",
      data: {
        token: order.token,
        fileId: order.fileId,
      },
    });
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

    if (!isPaymentSuccess(data)) {
      return NextResponse.json({
        status: 202,
        message: "Payment not completed",
        transaction_status: data.transaction_status,
        fraud_status: data.fraud_status,
      });
    }

    const grossAmount = Number(data.gross_amount);
    if (
      Number.isFinite(grossAmount) &&
      Math.abs(grossAmount - order.amount) > 0.01
    ) {
      return NextResponse.json(
        {
          status: 400,
          message: "Payment amount does not match order",
        },
        { status: 400 },
      );
    }

    console.log('Creating download token'); // Debug log
    const token = crypto.randomUUID();
    const user = await getUserByUsername(order.ownerUsername);
    if (!user || !user.id) {
      throw new Error(`User not found or missing ID: ${order.ownerUsername}`);
    }
    await createDownloadToken({
      token,
      fileId: order.fileId,
      userId: user.id,
      isValid: true,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    console.log('Download token created, updating download order'); // Debug log
    await updateDownloadOrder(orderId, { status: "paid", token });
    console.log('Download order updated'); // Debug log

    const paidDownload = await getPaidDownload(order.fileId);
    console.log('Paid download info:', paidDownload); // Debug log
    const ownerUsername = order.ownerUsername || paidDownload?.ownerUsername;
    if (!ownerUsername) {
      console.log('Owner not found for file:', order.fileId); // Debug log
      return NextResponse.json(
        {
          status: 400,
          message: "Owner not found",
        },
        { status: 400 },
      );
    }

    console.log('Creating download earning'); // Debug log
    const feeAmount = Math.round(order.amount * 0.01);
    const netAmount = Math.max(0, order.amount - feeAmount);
    try {
      await createDownloadEarning({
        username: ownerUsername,  // Changed from ownerUsername to username
        fileId: order.fileId,
        orderId: order.orderId,  // Add orderId for the frontend
        amount: order.amount,  // Use the order amount as the base amount
        netAmount,
        grossAmount: order.amount,
        feeAmount: feeAmount,  // Add feeAmount for the frontend
        status: "available",
      });
      console.log('Download earning created'); // Debug log
    } catch (error) {
      console.error('Error creating download earning:', error); // Debug log
      throw error;
    }

    return NextResponse.json({
      status: 200,
      message: "success",
      data: {
        token,
        fileId: order.fileId,
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
