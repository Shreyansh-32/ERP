"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, ShieldCheck, Users, LineChart, ArrowRight, GraduationCap, Recycle } from "lucide-react";
import { Space_Grotesk } from "next/font/google";

import { Button } from "@/components/ui/button";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.215, 0.61, 0.355, 1] as const } },
};

const stagger = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

export default function LandingPage() {
  const router = useRouter();

  return (
    <main
      className={`${spaceGrotesk.className} min-h-screen bg-slate-50 text-slate-900 relative overflow-hidden dark:bg-slate-950 dark:text-white`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.12),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(14,165,233,0.12),transparent_32%),radial-gradient(circle_at_50%_70%,rgba(16,185,129,0.1),transparent_35%)] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.18),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(14,165,233,0.18),transparent_32%),radial-gradient(circle_at_50%_70%,rgba(16,185,129,0.16),transparent_35%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(0,0,0,0.03),rgba(0,0,0,0))] dark:bg-[linear-gradient(120deg,rgba(255,255,255,0.04),rgba(255,255,255,0))]" />

      {/* HERO */}
      <section className="relative max-w-6xl mx-auto px-6 pt-24 pb-16 flex flex-col gap-12">
        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger}
          className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center"
        >
          <div className="space-y-6">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm text-slate-700 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-slate-100">
              <Sparkles className="h-4 w-4 text-amber-500 dark:text-amber-300" />
              Introducing CampussHub ERP + Alumni
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-4xl md:text-6xl font-semibold leading-tight tracking-tight text-slate-900 dark:text-white"
            >
              A lively campus OS for students, teachers, and alumni.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-lg md:text-xl text-slate-600 max-w-3xl leading-relaxed dark:text-slate-200/80"
            >
              Manage academics, attendance, assessments, and alumni connections in one sleek platform built for Government Engineering College Bilaspur.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
              <Button
                size="lg"
                onClick={() => router.push("/login")}
                className="bg-slate-900 text-white hover:bg-slate-800 px-7 dark:bg-white dark:text-slate-900 dark:hover:bg-white/90"
              >
                Get started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push("http://localhost:3001")}
                className="border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-white/30 dark:text-white dark:hover:bg-white/10"
              >
                Join Alumni
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push("/waste")}
                className="border-emerald-500 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-300/60 dark:text-emerald-50 dark:hover:bg-emerald-400/10"
              >
                Report Waste
              </Button>
            </motion.div>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-6 text-sm text-slate-200/80">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500 dark:text-emerald-300" />
                <span className="text-slate-600 dark:text-slate-200/80">Secure auth for all roles</span>
              </div>
              <div className="flex items-center gap-2">
                <LineChart className="h-4 w-4 text-sky-500 dark:text-sky-300" />
                <span className="text-slate-600 dark:text-slate-200/80">Analytics-ready dashboards</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-indigo-500 dark:text-indigo-300" />
                <span className="text-slate-600 dark:text-slate-200/80">Alumni collaboration hub</span>
              </div>
            </motion.div>
          </div>

          <motion.div variants={fadeUp} className="relative">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: [0.45, 0, 0.55, 1] as const }}
              className="relative rounded-2xl border border-slate-200 bg-white p-6 backdrop-blur shadow-2xl overflow-hidden dark:border-white/10 dark:bg-white/5"
            >
              <div className="absolute -top-20 -right-10 h-48 w-48 rounded-full bg-sky-400/20 blur-3xl dark:bg-sky-500/30" />
              <div className="absolute -bottom-16 -left-6 h-48 w-48 rounded-full bg-emerald-400/20 blur-3xl dark:bg-emerald-500/30" />
              <div className="relative space-y-4">
                <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-100/80">
                  <span className="font-medium text-slate-900 dark:text-white">Live dashboards</span>
                  <span className="rounded-full bg-slate-900 text-white px-3 py-1 text-xs dark:bg-white/10 dark:text-white">Real-time</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {["Attendance", "Assignments", "Quizzes", "CT Marks"].map((label) => (
                    <div key={label} className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-white/10 dark:bg-white/5">
                      <p className="text-slate-600 dark:text-slate-200/80">{label}</p>
                      <p className="text-lg font-semibold text-slate-900 dark:text-white">On track</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border border-slate-200 bg-gradient-to-r from-indigo-500/80 to-sky-500/80 px-5 py-4 text-white shadow-lg dark:border-white/10">
                  <p className="text-sm">CampussHub Pulse</p>
                  <p className="text-xl font-semibold">Unified ERP + Alumni data in one view</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* FEATURES */}
      <section className="relative max-w-6xl mx-auto px-6 pb-16">
        <div className="absolute inset-x-0 -top-16 h-24 bg-gradient-to-b from-white/10 to-transparent blur-2xl pointer-events-none" />
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={stagger} className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[
            {
              title: "Student Command",
              desc: "Track attendance, CTs, quizzes, assignments, and progress in one sleek dashboard.",
              icon: <LineChart className="h-5 w-5" />,
            },
            {
              title: "Faculty Ops",
              desc: "Speed through attendance, grading, and exports with intuitive flows and CSV tools.",
              icon: <ShieldCheck className="h-5 w-5" />,
            },
            {
              title: "Alumni Connect",
              desc: "Join the alumni space, mentor juniors, and stay aligned with campus events.",
              icon: <Users className="h-5 w-5" />,
            },
            {
              title: "Waste Management",
              desc: "Report, track, and resolve campus waste pickups to keep the grounds clean and green.",
              icon: <Recycle className="h-5 w-5" />,
            },
          ].map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeUp}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-lg backdrop-blur transition hover:-translate-y-1 hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20"
            >
              <div className="flex items-center gap-3 text-slate-900 dark:text-white">
                <span className="rounded-full bg-slate-900/5 p-2 text-sky-600 dark:bg-white/10 dark:text-sky-200">{feature.icon}</span>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
              </div>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed dark:text-slate-200/80">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* HIGHLIGHTS */}
      <section className="relative max-w-6xl mx-auto px-6 pb-16">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8"
        >
          <motion.div variants={fadeUp} className="rounded-2xl border border-slate-200 bg-white p-6 backdrop-blur shadow-xl space-y-4 dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-200/80">
              <GraduationCap className="h-4 w-4 text-amber-500 dark:text-amber-200" />
              Built for campus life
            </div>
            <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">Why CampussHub works</h3>
            <ul className="space-y-3 text-slate-600 text-sm leading-relaxed dark:text-slate-200/80">
              <li>Role-specific dashboards tuned for students, teachers, and admins.</li>
              <li>Modern tech stack: Next.js, Prisma, PostgreSQL, and ShadCN UI.</li>
              <li>Exports, analytics, and streamlined data entry save everyday time.</li>
              <li>Alumni network that keeps the campus heartbeat alive beyond graduation.</li>
            </ul>
          </motion.div>

          <motion.div variants={fadeUp} className="rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-500/10 via-sky-400/10 to-emerald-400/10 p-6 shadow-2xl backdrop-blur space-y-4 dark:border-white/10 dark:from-sky-600/80 dark:via-indigo-700/80 dark:to-emerald-500/60">
            <p className="text-sm text-slate-700 dark:text-slate-100/90">Instant entry</p>
            <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">Ready to explore?</h3>
            <p className="text-slate-700 text-sm dark:text-slate-100/80">Sign in to your role dashboard or head to the alumni lounge to start collaborating.</p>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900" onClick={() => router.push("/login")}>
                Open ERP Login
              </Button>
              <Button
                variant="outline"
                className="border-slate-400 text-slate-800 hover:bg-slate-100 dark:border-white/50 dark:text-white dark:hover:bg-white/10"
                onClick={() => router.push("http://localhost:3001")}
              >
                Alumni Lounge
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="relative border-t border-slate-200 bg-white/80 backdrop-blur py-6 text-center text-sm text-slate-600 dark:border-white/10 dark:bg-black/30 dark:text-slate-200/70">
        <div className="max-w-6xl mx-auto px-6">
          © {new Date().getFullYear()} CampussHub — Government Engineering College Bilaspur
        </div>
      </footer>
    </main>
  );
}
