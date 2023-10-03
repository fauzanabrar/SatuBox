import { create } from "zustand";

type ListStore = {
  files: any[];
  setFiles: (files: any) => void;
  loadingFolder: boolean;
  setLoadingFolder: (bool: boolean) => void;
  loadingFile: boolean;
  setLoadingFile: (bool: boolean) => void;
  loadingList: boolean;
  setLoadingList: (bool: boolean) => void;
  refreshList: () => Promise<void>;
};

const useListStore = create<ListStore>((set) => ({
  files: [],
  setFiles: (files: any) => set(() => ({files})),
  loadingFolder: false,
  setLoadingFolder: (bool: boolean) => set(() => ({ loadingFolder: bool })),
  loadingFile: false,
  setLoadingFile: (bool: boolean) => set(() => ({ loadingFile: bool })),
  loadingList: false,
  setLoadingList: (bool: boolean) => set(() => ({ loadingList: bool })),
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