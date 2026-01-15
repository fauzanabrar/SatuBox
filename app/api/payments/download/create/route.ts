import { NextRequest, NextResponse } from "next/server";
import { Buffer } from "buffer";
import {
  createDownloadOrder,
  getPaidDownload,
} from "@/lib/supabase/db/paid-download";

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
  console.log('Starting payment creation request'); // Debug log

  const { fileId } = await request.json();

  if (!fileId) {
    console.log('File ID is missing'); // Debug log
    return NextResponse.json(
      {
        status: 400,
        message: "fileId is required",
      },
      { status: 400 },
    );
  }

  console.log('Getting paid download info for file:', fileId); // Debug log
  const paidDownload = await getPaidDownload(fileId);
  console.log('Paid download info:', paidDownload); // Debug log

  if (!paidDownload || !paidDownload.enabled || paidDownload.price < 1000) {
    console.log('Paid download is not enabled or price is too low:', {
      exists: !!paidDownload,
      enabled: paidDownload?.enabled,
      price: paidDownload?.price
    }); // Debug log
    return NextResponse.json(
      {
        status: 400,
        message: "Paid download is not enabled for this file",
      },
      { status: 400 },
    );
  }
  if (!paidDownload.ownerUsername) {
    console.log('Paid download owner is missing'); // Debug log
    return NextResponse.json(
      {
        status: 400,
        message: "Paid download owner is missing",
      },
      { status: 400 },
    );
  }

  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  console.log('Server key exists:', !!serverKey); // Debug log
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
  console.log('Creating order with ID:', orderId, 'and amount:', grossAmount); // Debug log

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
    console.log('Making request to Midtrans API'); // Debug log
    const response = await fetch(getMidtransSnapUrl(), {
      method: "POST",
      headers: {
        Authorization: `Basic ${authHeader}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    console.log('Midtrans response:', { status: response.status, data }); // Debug log

    if (!response.ok) {
      console.log('Midtrans request failed'); // Debug log
      return NextResponse.json(
        {
          status: response.status,
          message: data?.status_message || "Failed to create transaction",
        },
        { status: response.status },
      );
    }

    console.log('Creating download order in database'); // Debug log
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
    console.log('Download order created successfully'); // Debug log

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
    console.error('Payment creation error:', error); // Debug log
    console.error('Error stack:', error.stack); // Debug log
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
