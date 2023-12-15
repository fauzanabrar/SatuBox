import { getFiles } from "@/app/dashboard/drive";
import { create } from "zustand";

type ListStore = {
  files: any[];
  setFiles: (files: any) => void;
  loadingList: boolean;
  setLoadingList: (bool: boolean) => void;
  refreshList: () => Promise<void>;
};

const useListStore = create<ListStore>((set) => ({
  files: [],
  setFiles: (files: any) => set(() => ({ files })),
  loadingList: true,
  setLoadingList: (bool: boolean) => set(() => ({ loadingList: bool })),
  refreshList: async () => {
    set({ loadingList: true });
    try {
      const files = await getFiles();
      set({ files });
    } catch (error) {
      console.error(error);
    } finally {
      set({ loadingList: false });
    }
  }
}));

export default useListStore;
