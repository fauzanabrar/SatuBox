import {getFileContent} from "@/lib/gdrive";

export async function getMedia(list: any[]) {
  const newFiles: any = [];
  for (const item of list) {
    if (!item.mimeType.includes("image")) {
      newFiles.push({id: item.id, name: item.name, type: item.mimeType});
    } else {
      const image: any = await getFileContent(item.id);
      newFiles.push({
        id: item.id,
        name: item.name,
        cover: `data:${item.mimeType};base64,${image}`,
        type: item.mimeType,
      });
    }
  }
  return newFiles;
}