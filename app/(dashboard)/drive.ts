export async function getFiles() {
  const pageSize = 10
  // const data = await fetch(`http://localhost:3000/api/drive/file?media=true`);
  const data = await fetch(`http://localhost:3000/api/drive/file?media=true&pageSize=${pageSize}`);
  const files = await data.json();
  return files.files;
}
