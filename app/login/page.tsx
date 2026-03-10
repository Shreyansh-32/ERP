"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Space_Grotesk } from "next/font/google";
import { ShieldCheck, Sparkles } from "lucide-react";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, UseFormReturn } from "react-hook-form";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

/* ---------- Zod Schema & Types ---------- */
const loginSchema = z.object({
  id: z.string().min(2, "ID is required"),
  password: z.string().min(3, "Password is too short"),
});

type FormValues = z.infer<typeof loginSchema>;

/* ---------- Component ---------- */
export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Call hooks directly (not inside helpers) to satisfy rules of hooks
  const studentForm = useForm<FormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { id: "", password: "" },
  });

  const teacherForm = useForm<FormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { id: "", password: "" },
  });

  const adminForm = useForm<FormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { id: "", password: "" },
  });

  // typed submit handler
  const submitHandler = async (values: FormValues, role: "student" | "teacher" | "admin") => {
    if (loading) return;
    setLoading(true);

    const toastId = toast.loading("Signing you in...");

    try {
      const res = await signIn("credentials", {
        id: values.id,
        password: values.password,
        role,
        redirect: false,
      });

      if (res?.error) {
        toast.error("Invalid credentials", { id: toastId });
        setLoading(false);
        return;
      }

      toast.success(`Welcome, ${role}!`, { id: toastId });

      setTimeout(() => {
        router.push(`/${role}/dashboard`);
      }, 600);
    } catch (err) {
      console.error("Sign in error", err);
      toast.error("Something went wrong", { id: toastId });
      setLoading(false);
    }
  };

  // renderForm is typed to accept a UseFormReturn<FormValues>
  const renderForm = (form: UseFormReturn<FormValues>, role: "student" | "teacher" | "admin") => (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => submitHandler(values, role))}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="id"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-800 dark:text-slate-100">{role === "student" ? "Roll Number" : "Employee ID"}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={role === "student" ? "300702222016" : "T-101"}
                  className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-slate-300 dark:bg-white/10 dark:border-white/20 dark:text-white dark:placeholder:text-slate-300 dark:focus-visible:ring-white/40"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-800 dark:text-slate-100">Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-slate-300 dark:bg-white/10 dark:border-white/20 dark:text-white dark:placeholder:text-slate-300 dark:focus-visible:ring-white/40"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-white/90"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>
    </Form>
  );

  return (
    <div
      className={`${spaceGrotesk.className} relative min-h-screen bg-slate-50 text-slate-900 overflow-hidden dark:bg-slate-950 dark:text-white`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.1),transparent_35%),radial-gradient(circle_at_80%_15%,rgba(14,165,233,0.12),transparent_32%),radial-gradient(circle_at_50%_75%,rgba(16,185,129,0.1),transparent_35%)] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.16),transparent_35%),radial-gradient(circle_at_80%_15%,rgba(14,165,233,0.18),transparent_32%),radial-gradient(circle_at_50%_75%,rgba(16,185,129,0.14),transparent_35%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(0,0,0,0.03),rgba(0,0,0,0))] dark:bg-[linear-gradient(120deg,rgba(255,255,255,0.04),rgba(255,255,255,0))]" />

      <div className="relative max-w-6xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-10 items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.215, 0.61, 0.355, 1] as const } }}
          className="space-y-5"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm text-slate-700 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-slate-100/90">
            <Sparkles className="h-4 w-4 text-amber-500 dark:text-amber-300" />
            CampussHub ERP
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold leading-tight text-slate-900 dark:text-white">Sign in to your campus workspace.</h1>
          <p className="text-slate-700 text-lg max-w-xl dark:text-slate-200/80">
            Access your role-based dashboard for attendance, assessments, and alumni connections with a refreshed, modern experience.
          </p>
          <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200/80">
            <ShieldCheck className="h-4 w-4 text-emerald-500 dark:text-emerald-300" />
            Secured authentication for students, teachers, and admins.
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.7, delay: 0.15, ease: [0.215, 0.61, 0.355, 1] as const } }}
          className="relative"
        >
          <Card className="w-full shadow-2xl border border-slate-200 bg-white backdrop-blur dark:border-white/10 dark:bg-white/10">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-semibold text-slate-900 dark:text-white">Welcome back</CardTitle>
              <p className="text-slate-600 text-sm dark:text-slate-200/70">Choose your role and continue to your dashboard.</p>
            </CardHeader>

            <CardContent>
              <Tabs defaultValue="student" className="w-full">
                <TabsList className="grid grid-cols-3 w-full mb-6 bg-slate-100 border border-slate-200 dark:bg-white/10 dark:border-white/15">
                  <TabsTrigger
                    value="student"
                    className="text-slate-700 data-[state=active]:bg-white data-[state=active]:text-slate-900 dark:text-slate-100 dark:data-[state=active]:bg-white/20 dark:data-[state=active]:text-white"
                  >
                    Student
                  </TabsTrigger>
                  <TabsTrigger
                    value="teacher"
                    className="text-slate-700 data-[state=active]:bg-white data-[state=active]:text-slate-900 dark:text-slate-100 dark:data-[state=active]:bg-white/20 dark:data-[state=active]:text-white"
                  >
                    Teacher
                  </TabsTrigger>
                  <TabsTrigger
                    value="admin"
                    className="text-slate-700 data-[state=active]:bg-white data-[state=active]:text-slate-900 dark:text-slate-100 dark:data-[state=active]:bg-white/20 dark:data-[state=active]:text-white"
                  >
                    Admin
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="student">{renderForm(studentForm, "student")}</TabsContent>
                <TabsContent value="teacher">{renderForm(teacherForm, "teacher")}</TabsContent>
                <TabsContent value="admin">{renderForm(adminForm, "admin")}</TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
