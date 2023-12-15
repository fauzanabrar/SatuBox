import { getFiles } from "@/app/dashboard/drive";
import { create } from "zustand";

type ListStore = {
  files: any[];
  setFiles: (files: any) => void;
  loadingList: boolean;
  setLoadingList: (bool: boolean) => void;
  refreshList: () => Promise<void>;
  revalidateList: () => Promise<void>;
};

const useListStore = create<ListStore>((set) => ({
  files: [],
  setFiles: (files: any) => set(() => ({ files })),
  loadingList: true,
  setLoadingList: (bool: boolean) => set(() => ({ loadingList: bool })),
  refreshList: async () => {
    set({ loadingList: true });
    console.log("fetching data");
    try {
      const files = await getFiles();
      set({ files });
    } catch (error) {
      console.error(error);
    } finally {
      set({ loadingList: false });
    }
  },
  revalidateList: async () => {
    try {
      await refreshData();
    } catch (error) {
      console.error(error);
    }
  },
}));

export default useListStore;

async function refreshData() {
  const body = {
    secret: process.env.NEXT_PUBLIC_SECRET_KEY as string,
  };
  await fetch("http://localhost:3000/api/drive/refresh", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
}
