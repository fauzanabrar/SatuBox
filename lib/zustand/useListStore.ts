import { getFiles } from "@/app/(dashboard)/drive";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ListStore = {
  files: any[];
  setFiles: (files: any) => void;
  loadingList: boolean;
  setLoadingList: (bool: boolean) => void;
  refreshList: (folderId: string | undefined) => Promise<void>;
  allFiles: any[];
  setAllFiles: (files: any) => void;
  changeAllFilesWithId: (filesId: string) => void;
  isChanged: boolean;
  setIsChanged: (bool: boolean) => void;
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
      refreshList: async (folderId: string | undefined) => {
        set({ loadingList: true });
        try {
          let files = [];
          if (folderId === undefined) {
            files = await getFiles("");
          } else {
            files = await getFiles(folderId);
          }
          set({ files });
        } catch (error) {
          console.error(error);
          set({ loadingList: false });
        } finally {
          set({ loadingList: false });
        }
      },
      setIsChanged: (bool: boolean) => set(() => ({ isChanged: bool })),
      isChanged: true,
      changeAllFilesWithId: (fileId: string) =>
        set((state: ListStore) => {
          return {
            allFiles: state.allFiles.filter((item) => item.id !== fileId),
          };
        }),
    }),
    {
      name: "liststore", // unique name
      skipHydration: true, // skip persistence on page refresh
      partialize: (state: ListStore) => ({
        files: state.files,
        allFiles: state.allFiles,
        isChanged: state.isChanged,
      }),
    },
  ),
);

export default useListStore;
