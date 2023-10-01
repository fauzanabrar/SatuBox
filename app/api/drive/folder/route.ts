import { NextResponse } from "next/server";
import {drive, auth} from '@googleapis/drive'


export async function GET() {

  const ab = new auth.GoogleAuth({
    keyFile: "./credentials.json",
    scopes: "https://www.googleapis.com/auth/drive",
  });

  const driveClient = drive({ version: "v3", auth: ab })


  //create folder
  // const folderMetadata = {
  //   name: "fdakjsfsajfl",
  //   mimeType: "application/vnd.google-apps.folder"
  // }

  // const folder = await driveClient.files.create({
  //   requestBody: folderMetadata,
  //   fields: "id"
  // })

  const lis = await driveClient.files.list({
  })

  return NextResponse.json({ message: lis.data })
}