import { getFiles } from "@/app/(dashboard)/drive";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ListStore = {
  files: any[];
  setFiles: (files: any) => void;
  loadingList: boolean;
  setLoadingList: (bool: boolean) => void;
  refreshList: () => Promise<void>;
  allFiles: any[];
  setAllFiles: (files: any) => void;
};

const useListStore = create(
  persist(
    (set) => ({
      files: [],
      allFiles: [],
      setAllFiles: (files: any) =>
        set((state: ListStore) => {
          return { allFiles: [...state.allFiles, ...files] };
        }),
      setFiles: (files: any) => set(() => ({ files })),
      loadingList: true,
      setLoadingList: (bool: boolean) => set(() => ({ loadingList: bool })),
      refreshList: async (folderId:string) => {
        set({ loadingList: true });
        try {
          const files = await getFiles(folderId);
          set({ files });
        } catch (error) {
          console.error(error);
          set({ loadingList: false });
        } finally {
          set({ loadingList: false });
        }
      },
    }),
    {
      name: "liststore", // unique name
    }
  )
);

export default useListStore;
