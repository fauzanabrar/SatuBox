import { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { FireStoreUser, getUserByUsername } from "@/lib/firebase/db/user";
import { compare } from "bcryptjs";
import { SessionType } from "@/types/api/auth";

interface UserToken {
  id: string;
  name: string;
  username: string;
  role: string;
  sub: string;
  iat: number;
  exp: number;
  jti: string;
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "username", type: "text", placeholder: "username" },
        password: {
          label: "Password",
          type: "password",
          placeholder: "password",
        },
      },
      async authorize(credentials) {
        // check credentials to db
        try {
          const user: FireStoreUser = await getUserByUsername(
            credentials?.username as string
          );
          const comparedPassword = await compare(
            credentials?.password as string,
            user.password
          );
          if (comparedPassword) {
            return {
              id: user.username,
              name: user.name,
              username: user.username,
              role: user.role,
            };
          }
          return null;
        } catch (e) {
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }: any): Promise<any> {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.username = user.username;
      }
      return token as UserToken;
    },
    async session({ session, token }: any): Promise<any> {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.username = token.username;
      }
      return session as SessionType;
    },
  },
  pages: {
    signIn: "/login",
    error: "/error",
    verifyRequest: "/verify-request",
    newUser: "/new-user",
  },
};
