import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { secret } = await req.json();

  if (secret !== process.env.SECRET_KEY) {
    return NextResponse.json({ message: "Secret Key Wrong!" }, { status: 401 });
  }

  revalidateTag("list-file");
  return NextResponse.json({ message: "Refresh success" });
}
