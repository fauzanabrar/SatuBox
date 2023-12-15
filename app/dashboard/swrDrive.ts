import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((res) => res.json())
function useGetData() {
  const { data, error } = useSWR(`http://localhost:3000/api/drive/file`, fetcher)
  return { data, error }

}
function useGetImageFile(item: any) {
  const { data, error } = useSWR(`http://localhost:3000/api/drive/file/${item.id}`, fetcher)
  return { data, error }

}

export function useGetFiles() {
  const { data, error } = useGetData()
  const newFiles: any = [];
  if(!data) return { data: [], error }
  for (const item of data.files) {
    if (!item.mimeType.includes("image")) {
      newFiles.push({ id: item.id, name: item.name, type: item.mimeType });
    } else {
      const { data, error } = useGetImageFile(item)
      newFiles.push({
        id: item.id,
        name: item.name,
        cover: `data:${item.mimeType};base64,${data.files}`,
        type: item.mimeType,
      });
    }
  }
  return { data: newFiles, error }
}
