"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex flex-col bg-muted/20">
      {/* HERO SECTION */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
          Government Engineering College Bilaspur
        </h1>

        <p className="mt-4 text-base md:text-lg max-w-2xl text-slate-600 dark:text-slate-300">
          A modern, secure academic management platform integrated with a
          dedicated alumni network — built for students, teachers, and graduates.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => router.push("/login")}
            size="lg"
            className="px-8 text-base bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
          >
            Login to ERP
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push("http://localhost:3001")}
            className="px-8 text-base border-slate-300 text-slate-700 dark:border-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Join Alumni Platform
          </Button>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-20 bg-background border-t border-slate-200/40 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-semibold text-center mb-12 text-slate-800 dark:text-slate-100">
            What You Can Do
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="shadow-sm border-slate-200/70 dark:border-slate-700 bg-white dark:bg-slate-900">
              <CardContent className="p-6 text-center space-y-3">
                <h3 className="text-xl font-medium text-slate-800 dark:text-slate-100">
                  📘 Student Portal
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Track attendance, CT marks, academic insights and access all
                  essential student resources in one place.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200/70 dark:border-slate-700 bg-white dark:bg-slate-900">
              <CardContent className="p-6 text-center space-y-3">
                <h3 className="text-xl font-medium text-slate-800 dark:text-slate-100">
                  🧑‍🏫 Teacher Portal
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Manage attendance, evaluate CTs, and coordinate classroom
                  activities through an intuitive dashboard.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200/70 dark:border-slate-700 bg-white dark:bg-slate-900">
              <CardContent className="p-6 text-center space-y-3">
                <h3 className="text-xl font-medium text-slate-800 dark:text-slate-100">
                  🎓 Alumni Network
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Connect with batchmates, mentor juniors, stay updated on
                  alumni events, and grow together.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="py-20 bg-muted/30 dark:bg-slate-950">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-slate-800 dark:text-slate-100">
            Why This Platform?
          </h2>
          <p className="text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed text-lg">
            Our ERP + Alumni Platform integrates academics, administration, and 
            lifelong networking in a single ecosystem. Built using modern
            technologies like <strong>Next.js, Prisma, PostgreSQL, and
            ShadCN/UI</strong>, it ensures reliability, security, and seamless
            user experience across roles.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-6 border-t border-slate-200 dark:border-slate-800 text-center text-slate-500 dark:text-slate-400 text-sm">
        © {new Date().getFullYear()} Government Engineering College Bilaspur —
        Integrated ERP & Alumni Platform
      </footer>
    </main>
  );
}
