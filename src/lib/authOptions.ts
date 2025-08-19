// src/lib/authOptions.ts
import type { GetServerSidePropsContext } from "next";
import { getServerSession, type NextAuthOptions, type DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Extend session and JWT types
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      email: string;
      name?: string | null;
      isAdmin: boolean;
    };
  }
  interface User {
    id: string;
    email: string;
    name?: string | null;
    isAdmin: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name?: string | null;
    isAdmin: boolean;
  }
}

export const authOptions: NextAuthOptions = {
  // Используем JWT без адаптера БД
  session: { strategy: "jwt" },

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim() || "";
        const password = credentials?.password || "";

        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ 
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
            isAdmin: true
          } 
        });
        
        if (!user || !user.password) return null;

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return null;

        return { 
          id: user.id, 
          email: user.email, 
          name: user.name ?? undefined,
          isAdmin: user.isAdmin || false
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.isAdmin = user.isAdmin || false;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        (session.user as any).isAdmin = token.isAdmin;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

// Helper for Pages Router / API routes
export const getServerAuthSession = (ctx?: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return ctx ? getServerSession(ctx.req, ctx.res, authOptions) : getServerSession(authOptions);
};
