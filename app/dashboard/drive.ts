export async function getFiles() {
  const data = await fetch(`http://localhost:3000/api/drive/file?media=true`);
  const files = await data.json();
  return files.files;
}
