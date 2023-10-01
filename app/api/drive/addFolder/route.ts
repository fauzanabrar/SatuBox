import { NextResponse } from "next/server";
import {drive, auth} from '@googleapis/drive'


export async function GET() {

  const ab = new auth.GoogleAuth({
    keyFile: "./credentials.json",
    scopes: "https://www.googleapis.com/auth/drive",
  });

  const driveClient = drive({ version: "v3", auth: ab })


  //create folder in folder
  // const folderMetadata = {
  //   name: "fdakjsfsajfl",
  //   mimeType: "application/vnd.google-apps.folder",
  //   parents: ["1Q0q0JZ6Q1w8Xg6w7xvXy6qjX5J5wQ8sO"]
  // }


  const folderMetadata = {
    name: "fdakjsfsajfl",
    mimeType: "application/vnd.google-apps.folder",
    parents: ["1cELGhDT-QHSSVndKjSoF9xS5yWPYFdNv"]
  }

  const folder = await driveClient.files.create({
    requestBody: folderMetadata,
    fields: "id"
  })

  return NextResponse.json({ message: "Folder created with ID: " + folder.data.id })
}