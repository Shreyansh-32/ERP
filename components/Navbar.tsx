"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { ThemeToggle } from "@/components/theme-toggle";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

import { Sparkles, User, LogOut } from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const role = session?.user?.role;
  const dashboardRoute =
    role === "student"
      ? "/student/dashboard"
      : role === "teacher"
      ? "/teacher/dashboard"
      : role === "admin"
      ? "/admin/dashboard"
      : "/";

  return (
    <nav className="w-full border-b border-slate-200/70 dark:border-slate-800/70 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-5 py-3 flex items-center justify-between">
        
        {/* Left Side: Logo / Home */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-xl font-semibold text-slate-800 dark:text-slate-100 tracking-tight"
          >
            <Sparkles className="h-5 w-5 text-indigo-600" />
            CampussHub
          </button>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {!session ? (
            <Button onClick={() => router.push("/login")} variant="outline">
              Login
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex gap-2 items-center">
                  <User className="h-4 w-4" />
                  {session.user.name || "User"}
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-40 mr-2">
                <DropdownMenuLabel className="capitalize">
                  {session.user.role}
                </DropdownMenuLabel>

                <DropdownMenuItem onClick={() => router.push(dashboardRoute)}>
                  Dashboard
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </nav>
  );
}
