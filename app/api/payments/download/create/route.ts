import { NextRequest, NextResponse } from "next/server";
import { Buffer } from "buffer";
import {
  createDownloadOrder,
  getPaidDownload,
} from "@/lib/firebase/db/paid-download";

const getMidtransSnapUrl = () =>
  process.env.MIDTRANS_ENV === "production"
    ? "https://app.midtrans.com/snap/v1/transactions"
    : "https://app.sandbox.midtrans.com/snap/v1/transactions";

const sanitizeOrderId = (value: string) =>
  value.replace(/[^a-zA-Z0-9-_]/g, "-");

const buildOrderId = (fileId: string) => {
  const timePart = Date.now().toString(36);
  const filePart = sanitizeOrderId(fileId).slice(0, 12);
  return `dl-${timePart}-${filePart}`;
};

export async function POST(request: NextRequest) {
  const { fileId } = await request.json();

  if (!fileId) {
    return NextResponse.json(
      {
        status: 400,
        message: "fileId is required",
      },
      { status: 400 },
    );
  }

  const paidDownload = await getPaidDownload(fileId);
  if (
    !paidDownload ||
    !paidDownload.enabled ||
    paidDownload.price < 1000
  ) {
    return NextResponse.json(
      {
        status: 400,
        message: "Paid download is not enabled for this file",
      },
      { status: 400 },
    );
  }
  if (!paidDownload.ownerUsername) {
    return NextResponse.json(
      {
        status: 400,
        message: "Paid download owner is missing",
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

  const grossAmount = paidDownload.price;
  const orderId = buildOrderId(fileId);

  const body = {
    transaction_details: {
      order_id: orderId,
      gross_amount: grossAmount,
    },
    item_details: [
      {
        id: fileId,
        price: grossAmount,
        quantity: 1,
        name: "Paid file download",
      },
    ],
    custom_field1: fileId,
    custom_field2: "download",
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

  await createDownloadOrder({
    orderId,
    fileId,
    ownerUsername: paidDownload.ownerUsername,
    amount: grossAmount,
    currency: paidDownload.currency ?? "IDR",
    status: "pending",
    token: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

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
