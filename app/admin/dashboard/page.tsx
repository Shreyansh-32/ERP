"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";

/* ================= TYPES ================= */

type Branch = {
  id: number;
  name: string;
};

type Teacher = {
  id: number;
  name: string;
  employeeId: string;
};

/* ================= CONSTANTS ================= */

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

/* ================= COMPONENT ================= */

export default function AdminDashboard() {
  /* ---------- Shared ---------- */
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(true);

  /* ---------- Teacher ---------- */
  const [teacher, setTeacher] = useState({
    employeeId: "",
    name: "",
    password: "",
    branchId: "",
  });

  /* ---------- Student ---------- */
  const [student, setStudent] = useState({
    roll: "",
    name: "",
    password: "",
    semester: "",
    branchId: "",
  });

  /* ---------- Subject ---------- */
  const [subject, setSubject] = useState({
    name: "",
    semester: "",
    branchId: "",
    teacherId: "",
  });

  const [branchTeachers, setBranchTeachers] = useState<Teacher[]>([]);

  /* ---------- Submitting ---------- */
  const [submitting, setSubmitting] = useState({
    teacher: false,
    student: false,
    subject: false,
  });

  /* ================= FETCH BRANCHES ================= */

  useEffect(() => {
    fetch("/api/admin/branches")
      .then((res) => res.json())
      .then((data) => setBranches(data.branches ?? []))
      .catch(() => toast.error("Failed to load branches"))
      .finally(() => setLoadingBranches(false));
  }, []);

  /* ================= HELPERS ================= */

  const runSubmit = async (
    key: "teacher" | "student" | "subject",
    url: string,
    payload: unknown,
    onSuccess?: () => void
  ) => {
    setSubmitting((prev) => ({ ...prev, [key]: true }));
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Operation failed");
        return;
      }

      toast.success("Saved successfully");
      onSuccess?.();
    } catch (e) {
      toast.error("Something went wrong");
    } finally {
      setSubmitting((prev) => ({ ...prev, [key]: false }));
    }
  };

  const fetchTeachersByBranch = async (branchId: string) => {
    setBranchTeachers([]);
    setSubject((prev) => ({ ...prev, teacherId: "" }));

    if (!branchId) return;

    const res = await fetch(
      `/api/admin/teachers/by-branch?branchId=${branchId}`
    );

    const data = await res.json();
    setBranchTeachers(data.teachers ?? []);
  };

  /* ================= VALIDATION ================= */

  const canSubmitTeacher = useMemo(
    () =>
      Boolean(
        teacher.employeeId && teacher.name && teacher.password && teacher.branchId && !submitting.teacher
      ),
    [teacher, submitting.teacher]
  );

  const canSubmitStudent = useMemo(
    () =>
      Boolean(
        student.roll &&
          student.name &&
          student.password &&
          student.semester &&
          student.branchId &&
          !submitting.student
      ),
    [student, submitting.student]
  );

  const canSubmitSubject = useMemo(
    () =>
      Boolean(
        subject.name &&
          subject.semester &&
          subject.branchId &&
          subject.teacherId &&
          !submitting.subject
      ),
    [subject, submitting.subject]
  );

  const resetTeacher = () => setTeacher({ employeeId: "", name: "", password: "", branchId: "" });
  const resetStudent = () =>
    setStudent({ roll: "", name: "", password: "", semester: "", branchId: "" });
  const resetSubject = () =>
    setSubject({ name: "", semester: "", branchId: "", teacherId: "" });

  /* ================= UI ================= */

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <div className="pointer-events-none absolute inset-x-0 -top-20 -z-10 h-56 bg-gradient-to-r from-sky-500/15 via-indigo-500/10 to-emerald-500/10 blur-3xl" />

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Admin</p>
            <h1 className="text-3xl font-semibold tracking-tight">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage teachers, students, and subjects in one place.</p>
          </div>
          <Badge variant="outline">Branches: {branches.length || 0}</Badge>
        </header>

        <Tabs defaultValue="teacher" className="space-y-6">
          <TabsList className="bg-card/80 backdrop-blur">
            <TabsTrigger value="teacher">Add Teacher</TabsTrigger>
            <TabsTrigger value="student">Add Student</TabsTrigger>
            <TabsTrigger value="subject">Add Subject</TabsTrigger>
          </TabsList>

          {/* ================= ADD TEACHER ================= */}
          <TabsContent value="teacher">
            <Card className="shadow-sm border-border/70 bg-card/90 backdrop-blur">
              <CardHeader className="flex flex-col gap-2">
                <CardTitle>Add Teacher</CardTitle>
                <p className="text-sm text-muted-foreground">Create teacher login and link them to a branch.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Employee ID"
                  value={teacher.employeeId}
                  onChange={(e) => setTeacher({ ...teacher, employeeId: e.target.value })}
                />

                <Input
                  placeholder="Full Name"
                  value={teacher.name}
                  onChange={(e) => setTeacher({ ...teacher, name: e.target.value })}
                />

                <Input
                  type="password"
                  placeholder="Password"
                  value={teacher.password}
                  onChange={(e) => setTeacher({ ...teacher, password: e.target.value })}
                />

                <Select
                  value={teacher.branchId}
                  onValueChange={(v) => setTeacher({ ...teacher, branchId: v })}
                  disabled={loadingBranches}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingBranches ? "Loading branches..." : "Select Branch"} />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((b) => (
                      <SelectItem key={b.id} value={b.id.toString()}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-2 justify-end">
                  <Button variant="ghost" onClick={resetTeacher} disabled={submitting.teacher}>
                    Reset
                  </Button>
                  <Button
                    onClick={() =>
                      runSubmit("teacher", "/api/admin/teacher", {
                        ...teacher,
                        branchId: Number(teacher.branchId),
                      }, resetTeacher)
                    }
                    disabled={!canSubmitTeacher}
                  >
                    {submitting.teacher ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Teacher"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ================= ADD STUDENT ================= */}
          <TabsContent value="student">
            <Card className="shadow-sm border-border/70 bg-card/90 backdrop-blur">
              <CardHeader className="flex flex-col gap-2">
                <CardTitle>Add Student</CardTitle>
                <p className="text-sm text-muted-foreground">Create student login and place them into the right branch and semester.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Roll Number"
                  value={student.roll}
                  onChange={(e) => setStudent({ ...student, roll: e.target.value })}
                />

                <Input
                  placeholder="Full Name"
                  value={student.name}
                  onChange={(e) => setStudent({ ...student, name: e.target.value })}
                />

                <Input
                  type="password"
                  placeholder="Password"
                  value={student.password}
                  onChange={(e) => setStudent({ ...student, password: e.target.value })}
                />

                <Select
                  value={student.semester}
                  onValueChange={(v) => setStudent({ ...student, semester: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEMESTERS.map((s) => (
                      <SelectItem key={s} value={s.toString()}>
                        Semester {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={student.branchId}
                  onValueChange={(v) => setStudent({ ...student, branchId: v })}
                  disabled={loadingBranches}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingBranches ? "Loading branches..." : "Select Branch"} />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((b) => (
                      <SelectItem key={b.id} value={b.id.toString()}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-2 justify-end">
                  <Button variant="ghost" onClick={resetStudent} disabled={submitting.student}>
                    Reset
                  </Button>
                  <Button
                    onClick={() =>
                      runSubmit("student", "/api/admin/student", {
                        ...student,
                        semester: Number(student.semester),
                        branchId: Number(student.branchId),
                      }, resetStudent)
                    }
                    disabled={!canSubmitStudent}
                  >
                    {submitting.student ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Student"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ================= ADD SUBJECT ================= */}
          <TabsContent value="subject">
            <Card className="shadow-sm border-border/70 bg-card/90 backdrop-blur">
              <CardHeader className="flex flex-col gap-2">
                <CardTitle>Add Subject</CardTitle>
                <p className="text-sm text-muted-foreground">Create a subject, tie it to a branch/semester, and assign a teacher.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Subject Name"
                  value={subject.name}
                  onChange={(e) => setSubject({ ...subject, name: e.target.value })}
                />

                <Select
                  value={subject.semester}
                  onValueChange={(v) => setSubject({ ...subject, semester: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEMESTERS.map((s) => (
                      <SelectItem key={s} value={s.toString()}>
                        Semester {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={subject.branchId}
                  onValueChange={(v) => {
                    setSubject({ ...subject, branchId: v });
                    fetchTeachersByBranch(v);
                  }}
                  disabled={loadingBranches}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingBranches ? "Loading branches..." : "Select Branch"} />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((b) => (
                      <SelectItem key={b.id} value={b.id.toString()}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={subject.teacherId}
                  onValueChange={(v) => setSubject({ ...subject, teacherId: v })}
                  disabled={!branchTeachers.length}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={branchTeachers.length ? "Assign Teacher" : "Select branch first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {branchTeachers.map((t) => (
                      <SelectItem key={t.id} value={t.id.toString()}>
                        {t.name} ({t.employeeId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-2 justify-end">
                  <Button variant="ghost" onClick={resetSubject} disabled={submitting.subject}>
                    Reset
                  </Button>
                  <Button
                    onClick={() =>
                      runSubmit("subject", "/api/admin/subject", {
                        name: subject.name,
                        semester: Number(subject.semester),
                        branchId: Number(subject.branchId),
                        teacherId: Number(subject.teacherId),
                      }, resetSubject)
                    }
                    disabled={!canSubmitSubject}
                  >
                    {submitting.subject ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Subject"}
                  </Button>
                </div>

                {branchTeachers.length > 0 && (
                  <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                    {branchTeachers.length} teacher{branchTeachers.length === 1 ? "" : "s"} available for this branch.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Separator />
        <p className="text-sm text-muted-foreground">Tip: Fill required fields to enable the save buttons. Use Reset to clear a form quickly.</p>
      </div>
    </div>
  );
}
