import { create } from "zustand";

type ListStore = {
  files: any[];
  loadingFolder: boolean;
  loadingFile: boolean;
  loadingList: boolean;
  refreshList: () => Promise<void>;
};

const useListStore = create<ListStore>((set) => ({
  files: [],
  loadingFolder: false,
  loadingFile: false,
  loadingList: false,
  refreshList: async () => {
    set({ loadingList: true });
    console.log("fetching data");
    try {
      const response = await fetch(`http://localhost:3000/api/drive/file`);
      const data = await response.json();
      const newFiles = [];
      for (const item of data.files) {
        if (!item.mimeType.includes("image")) {
          newFiles.push({ id: item.id, name: item.name, type: item.mimeType });
        } else {
          const fetchImage = await fetch(
            `http://localhost:3000/api/drive/file/${item.id}`
          );
          const data = await fetchImage.json();
          newFiles.push({
            id: item.id,
            name: item.name,
            cover: `data:${item.mimeType};base64,${data.files}`,
            type: item.mimeType,
          });
        }
      }
      set({ files: newFiles });
      console.log("fetching berhasil");
    } catch (error) {
      console.error(error);
    } finally {
      set({ loadingList: false });
      set({ loadingFile: false });
      set({ loadingFolder: false });
    }
  },
}));

export default useListStore;