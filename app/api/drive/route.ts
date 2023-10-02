import { NextRequest, NextResponse } from "next/server";
import {drive} from "@googleapis/drive"
import { NextApiRequest } from "next";


export async function GET() {
  return NextResponse.json({ message: "Folder created with ID: "  })
}