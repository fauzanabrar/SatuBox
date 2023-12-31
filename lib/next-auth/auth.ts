import { User } from "@/types/userTypes";
import { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getUserByEmail } from "@/lib/firebase/db";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "email", type: "text", placeholder: "email" },
        password: {
          label: "Password",
          type: "password",
          placeholder: "password",
        },
      },
      async authorize(credentials) {
        // const user: User = {
        //   id: "1",
        //   name: "J Smith",
        //   email: "admin@gmail.com",
        //   role: "admin",
        // };

        // check credentials to db
        const user: any = await getUserByEmail(credentials?.email as string);

        if (user.password === credentials?.password) {
          return user;
        } else {
          return null;
        }

        // if (user) {
        //   return user;
        // } else {
        //   return null;
        // }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, account, profile, isNewUser }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token, user }: any) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
};