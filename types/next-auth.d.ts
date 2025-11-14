// /types/next-auth.d.ts
import NextAuth from "next-auth";

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
