import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { SessionType, UserSession } from "@/types/api/auth/auth";

export async function getUserSession(): Promise<UserSession> {
  const userSession = await getServerSession<any, SessionType>(authOptions);

  return userSession?.user as UserSession;
}
