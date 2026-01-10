import { NextRequest, NextResponse } from "next/server";
import { Buffer } from "buffer";
import crypto from "node:crypto";
import {
  createDownloadToken,
  getDownloadOrder,
  updateDownloadOrder,
  getPaidDownload,
} from "@/lib/firebase/db/paid-download";
import { createDownloadEarning } from "@/lib/firebase/db/earnings";

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

    const token = crypto.randomUUID();
    await createDownloadToken({
      token,
      fileId: order.fileId,
      orderId: order.orderId,
      amount: order.amount,
      currency: order.currency,
      createdAt: new Date(),
    });
    await updateDownloadOrder(orderId, { status: "paid", token });

    const paidDownload = await getPaidDownload(order.fileId);
    const ownerUsername =
      order.ownerUsername || paidDownload?.ownerUsername;
    if (!ownerUsername) {
      return NextResponse.json(
        {
          status: 400,
          message: "Owner not found",
        },
        { status: 400 },
      );
    }

    const feeAmount = Math.round(order.amount * 0.01);
    const netAmount = Math.max(0, order.amount - feeAmount);
    await createDownloadEarning({
      orderId: order.orderId,
      fileId: order.fileId,
      ownerUsername,
      grossAmount: order.amount,
      feeAmount,
      netAmount,
      currency: order.currency,
      status: "available",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

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
