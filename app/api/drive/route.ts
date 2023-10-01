import { NextRequest, NextResponse } from "next/server";
import {drive} from "@googleapis/drive"
import { NextApiRequest } from "next";


export async function GET() {
console.log('runnignadklfj');
  return NextResponse.json({ message: "Folder created with ID: "  })
}