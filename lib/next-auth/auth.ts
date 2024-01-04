import {NextAuthOptions} from "next-auth";
import Credentials from "next-auth/providers/credentials";
import {FireStoreUser, getUserByEmail} from "@/lib/firebase/db/user";
import {compare} from "bcryptjs";

interface UserToken {
  id: string;
  name: string;
  email: string;
  role: string;
  sub: string;
  iat: number;
  exp: number;
  jti: string;
}

export interface UserSession {
  user: {
    id: string;
    name: string;
    email: string;
    image: string;
    role: string;
  };
  expires: string;

}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: {label: "email", type: "text", placeholder: "email"},
        password: {
          label: "Password",
          type: "password",
          placeholder: "password",
        },
      },
      async authorize(credentials) {
        // check credentials to db
        try {
          const user: FireStoreUser = await getUserByEmail(credentials?.email as string);
          const comparedPassword = await compare(credentials?.password as string, user.password);
          if (comparedPassword) {
            return {
              id: user.email,
              name: user.name,
              email: user.email,
              role: user.role,
            };
          }
          return null;
        } catch (e) {
          return null
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({token, user, account, profile, isNewUser}: any): Promise<any> {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token as UserToken;
    },
    async session({session, token, user}: any): Promise<any> {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session as UserSession;
    },
  },
  pages: {
    signIn: "/login",
    error: "/error",
    verifyRequest: "/verify-request",
    newUser: "/new-user",
  }
};