import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

/* ========= Type Augmentations ========= */

declare module "next-auth" {
  interface User {
    id: string;
    name?: string | null;
    role: "student" | "teacher" | "admin";
    identifier: string;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      role: "student" | "teacher" | "admin";
      identifier: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "student" | "teacher" | "admin";
    identifier?: string;
  }
}

/* ========= Auth User Type ========= */
type AuthUser = {
  id: string;
  name?: string | null;
  role: "student" | "teacher" | "admin";
  identifier: string;
};

/* ========= NextAuth Configuration ========= */
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        id: {
          label: "Roll / Employee ID",
          type: "text",
          placeholder: "e.g. 22CS101 or T-101",
        },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text", placeholder: "student | teacher | admin" },
      },

      async authorize(credentials): Promise<AuthUser | null> {
        if (!credentials?.id || !credentials.password || !credentials.role) {
          return null;
        }

        const id = credentials.id.trim();
        const password = credentials.password;
        const role = credentials.role.trim().toLowerCase();

        try {
          // --- Student ---
          if (role === "student") {
            const student = await prisma.student.findUnique({ where: { roll: id } });
            if (!student) return null;
            const valid = await bcrypt.compare(password, student.password);
            if (!valid) return null;

            return {
              id: student.id.toString(),
              name: student.name ?? null,
              role: "student",
              identifier: student.roll,
            };
          }

          // --- Teacher ---
          if (role === "teacher") {
            const teacher = await prisma.teacher.findUnique({ where: { employeeId: id } });
            if (!teacher) return null;
            const valid = await bcrypt.compare(password, teacher.password);
            if (!valid) return null;

            return {
              id: teacher.id.toString(),
              name: teacher.name ?? null,
              role: "teacher",
              identifier: teacher.employeeId,
            };
          }

          // --- Admin ---
          if (role === "admin") {
            const admin = await prisma.admin.findUnique({ where: { employeeId: id } });
            if (!admin) return null;
            const valid = await bcrypt.compare(password, admin.password);
            if (!valid) return null;

            return {
              id: admin.id.toString(),
              name: admin.name ?? null,
              role: "admin",
              identifier: admin.employeeId,
            };
          }

          return null;
        } catch (err) {
          console.error("NextAuth authorize error:", err);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }): Promise<JWT> {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.identifier = user.identifier;
      }
      return token;
    },

    async session({ session, token }) {
      session.user = {
        id: token.id as string,
        name: session.user?.name ?? null,
        role: (token.role || "student") as "student" | "teacher" | "admin",
        identifier: token.identifier as string,
      };
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/error",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,
};
