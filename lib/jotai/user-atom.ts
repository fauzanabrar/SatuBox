import { UserSession } from "@/types/api/auth";
import { atom } from "jotai";

export const userAtom = atom<UserSession>({
  username: "",
  name: "",
  role: "",
  id: "",
  image: "",
});
