export async function getFiles(folderId: string) {
  const pageSize = 10;
  // const data = await fetch(`http://localhost:3000/api/drive/file?media=true`);
  if (folderId !== "") {
    const data = await fetch(`http://localhost:3000/api/drive/folder/${folderId}`);
    const files = await data.json();
    return files.files;
  }
  const data = await fetch(
    `http://localhost:3000/api/drive/file?media=true&pageSize=${pageSize}`
  );
  const files = await data.json();
  return files.files;
}
