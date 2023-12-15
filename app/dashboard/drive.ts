async function getData() {
  const response = await fetch(`http://localhost:3000/api/drive/file`, {
    next: { tags: ["list-file"] },
  });
  const data = await response.json();

  return data;
}

async function getImageFile(item:any) {
  const fetchImage = await fetch(
    `http://localhost:3000/api/drive/file/${item.id}`
  );
  const data = await fetchImage.json();
  return data;
}

export async function getFiles() {
  const data = await getData();
  const newFiles: any = [];
  for (const item of data.files) {
    if (!item.mimeType.includes("image")) {
      newFiles.push({ id: item.id, name: item.name, type: item.mimeType });
    } else {
      const image = await getImageFile(item);
      newFiles.push({
        id: item.id,
        name: item.name,
        cover: `data:${item.mimeType};base64,${image.files}`,
        type: item.mimeType,
      });
    }
  }
  return newFiles;
}
