"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";

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
              <FormLabel>{role === "student" ? "Roll Number" : "Employee ID"}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={role === "student" ? "300702222016" : "T-101"}
                  className="bg-white dark:bg-slate-800"
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
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="bg-white dark:bg-slate-800"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>
    </Form>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4">
      <Card className="w-full max-w-md shadow-md border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-semibold">College ERP Login</CardTitle>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="student" className="w-full">
            <TabsList className="grid grid-cols-3 w-full mb-6 bg-slate-200/40 dark:bg-slate-800/40">
              <TabsTrigger value="student">Student</TabsTrigger>
              <TabsTrigger value="teacher">Teacher</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
            </TabsList>

            <TabsContent value="student">{renderForm(studentForm, "student")}</TabsContent>
            <TabsContent value="teacher">{renderForm(teacherForm, "teacher")}</TabsContent>
            <TabsContent value="admin">{renderForm(adminForm, "admin")}</TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
