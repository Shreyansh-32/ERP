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
import { Loader2, Download, Edit2, Trash2 } from "lucide-react";

/* ================= TYPES ================= */

type Branch = {
  id: number;
  name: string;
};

type Teacher = {
  id: number;
  name: string;
  employeeId: string;
  branchId?: number;
};

type Student = {
  id: number;
  roll: string;
  name: string;
  semester: number;
  branchId: number;
};

type Subject = {
  id: number;
  name: string;
  semester: number;
  branchId: number;
  teachers: Teacher[];
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

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [editTeacherForm, setEditTeacherForm] = useState({
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

  const [students, setStudents] = useState<Student[]>([]);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editStudentForm, setEditStudentForm] = useState({
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

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [editSubjectForm, setEditSubjectForm] = useState({
    name: "",
    semester: "",
    branchId: "",
    teacherId: "",
  });

  const [branchTeachers, setBranchTeachers] = useState<Teacher[]>([]);

  /* ---------- Export Attendance ---------- */
  const [exportAttendance, setExportAttendance] = useState({
    branchId: "",
    semester: "",
  });
  const [exportingAttendance, setExportingAttendance] = useState(false);

  /* ---------- Submitting ---------- */
  const [submitting, setSubmitting] = useState({
    teacher: false,
    student: false,
    subject: false,
    editTeacher: false,
    editStudent: false,
    editSubject: false,
    deleteTeacher: false,
    deleteStudent: false,
    deleteSubject: false,
  });

  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

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
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting((prev) => ({ ...prev, [key]: false }));
    }
  };

  const runUpdate = async (
    key: "editTeacher" | "editStudent" | "editSubject",
    url: string,
    payload: unknown,
    onSuccess?: () => void
  ) => {
    setSubmitting((prev) => ({ ...prev, [key]: true }));
    try {
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Operation failed");
        return;
      }

      toast.success("Updated successfully");
      onSuccess?.();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting((prev) => ({ ...prev, [key]: false }));
    }
  };

  const runDelete = async (
    key: "deleteTeacher" | "deleteStudent" | "deleteSubject",
    url: string,
    onSuccess?: () => void
  ) => {
    if (!window.confirm("Are you sure you want to delete this item?")) {
      return;
    }

    setSubmitting((prev) => ({ ...prev, [key]: true }));
    try {
      const res = await fetch(url, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Operation failed");
        return;
      }

      toast.success("Deleted successfully");
      onSuccess?.();
    } catch {
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

  const fetchTeachers = async (branchId?: string) => {
    setLoadingTeachers(true);
    try {
      const url = branchId
        ? `/api/admin/teacher?branchId=${branchId}`
        : "/api/admin/teacher";

      const res = await fetch(url);
      const data = await res.json();
      setTeachers(data.teachers ?? []);
    } catch {
      toast.error("Failed to load teachers");
    } finally {
      setLoadingTeachers(false);
    }
  };

  const fetchStudents = async (branchId?: string, semester?: string) => {
    setLoadingStudents(true);
    try {
      const params = new URLSearchParams();
      if (branchId) params.append("branchId", branchId);
      if (semester) params.append("semester", semester);

      const url = `/api/admin/student?${params.toString()}`;
      const res = await fetch(url);
      const data = await res.json();
      setStudents(data.students ?? []);
    } catch {
      toast.error("Failed to load students");
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchSubjects = async (branchId?: string, semester?: string) => {
    setLoadingSubjects(true);
    try {
      const params = new URLSearchParams();
      if (branchId) params.append("branchId", branchId);
      if (semester) params.append("semester", semester);

      const url = `/api/admin/subject?${params.toString()}`;
      const res = await fetch(url);
      const data = await res.json();
      setSubjects(data.subjects ?? []);
    } catch {
      toast.error("Failed to load subjects");
    } finally {
      setLoadingSubjects(false);
    }
  };

  const exportAttendanceFile = async () => {
    if (!exportAttendance.branchId || !exportAttendance.semester) {
      toast.error("Please select both branch and semester");
      return;
    }

    setExportingAttendance(true);
    try {
      const url = `/api/admin/attendance/export?branchId=${exportAttendance.branchId}&semester=${exportAttendance.semester}`;
      const res = await fetch(url);

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to export attendance");
        return;
      }

      const blob = await res.blob();
      const finalUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = finalUrl;
      a.download = `attendance_export_branch_${exportAttendance.branchId}_sem_${exportAttendance.semester}.csv`;
      a.click();
      window.URL.revokeObjectURL(finalUrl);
      toast.success("Attendance exported successfully");
    } catch {
      toast.error("Failed to export attendance");
    } finally {
      setExportingAttendance(false);
    }
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
    <div className="relative min-h-screen bg-linear-to-b from-background via-background to-muted/30">
      <div className="pointer-events-none absolute inset-x-0 -top-20 -z-10 h-56 bg-linear-to-r from-sky-500/15 via-indigo-500/10 to-emerald-500/10 blur-3xl" />

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
          <TabsList className="bg-card/80 backdrop-blur flex flex-wrap h-auto">
            <TabsTrigger value="teacher">Add Teacher</TabsTrigger>
            <TabsTrigger value="student">Add Student</TabsTrigger>
            <TabsTrigger value="subject">Add Subject</TabsTrigger>
            <TabsTrigger value="export-attendance">Export Attendance</TabsTrigger>
            <TabsTrigger value="manage-teacher">Manage Teachers</TabsTrigger>
            <TabsTrigger value="manage-student">Manage Students</TabsTrigger>
            <TabsTrigger value="manage-subject">Manage Subjects</TabsTrigger>
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

          {/* ================= EXPORT ATTENDANCE ================= */}
          <TabsContent value="export-attendance">
            <Card className="shadow-sm border-border/70 bg-card/90 backdrop-blur">
              <CardHeader className="flex flex-col gap-2">
                <CardTitle>Export Overall Attendance</CardTitle>
                <p className="text-sm text-muted-foreground">Select a branch and semester to export attendance for all subjects.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  value={exportAttendance.branchId}
                  onValueChange={(v) => setExportAttendance({ ...exportAttendance, branchId: v })}
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
                  value={exportAttendance.semester}
                  onValueChange={(v) => setExportAttendance({ ...exportAttendance, semester: v })}
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

                <div className="flex items-center gap-2 justify-end">
                  <Button
                    onClick={exportAttendanceFile}
                    disabled={exportingAttendance || !exportAttendance.branchId || !exportAttendance.semester}
                  >
                    {exportingAttendance ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Export Attendance
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ================= MANAGE TEACHERS ================= */}
          <TabsContent value="manage-teacher">
            <Card className="shadow-sm border-border/70 bg-card/90 backdrop-blur">
              <CardHeader className="flex flex-col gap-2">
                <CardTitle>Manage Teachers</CardTitle>
                <p className="text-sm text-muted-foreground">View, edit, or delete existing teachers.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {editingTeacher ? (
                  <>
                    <div className="p-4 border rounded-md bg-muted/40 space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">Edit Teacher: {editingTeacher.employeeId}</h3>
                        <p className="text-sm text-muted-foreground mb-4">Update teacher details</p>
                      </div>

                      <Input
                        placeholder="Full Name"
                        value={editTeacherForm.name}
                        onChange={(e) => setEditTeacherForm({ ...editTeacherForm, name: e.target.value })}
                      />

                      <Input
                        type="password"
                        placeholder="Password (leave empty to keep current)"
                        value={editTeacherForm.password}
                        onChange={(e) => setEditTeacherForm({ ...editTeacherForm, password: e.target.value })}
                      />

                      <Select
                        value={editTeacherForm.branchId}
                        onValueChange={(v) => setEditTeacherForm({ ...editTeacherForm, branchId: v })}
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

                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setEditingTeacher(null);
                            setEditTeacherForm({ name: "", password: "", branchId: "" });
                          }}
                          disabled={submitting.editTeacher}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => {
                            if (!editTeacherForm.name || !editTeacherForm.branchId) {
                              toast.error("Name and branch are required");
                              return;
                            }
                            runUpdate(
                              "editTeacher",
                              `/api/admin/teacher/${editingTeacher.id}`,
                              {
                                name: editTeacherForm.name,
                                password: editTeacherForm.password || undefined,
                                branchId: Number(editTeacherForm.branchId),
                              },
                              () => {
                                setEditingTeacher(null);
                                setEditTeacherForm({ name: "", password: "", branchId: "" });
                                fetchTeachers();
                              }
                            );
                          }}
                          disabled={submitting.editTeacher}
                        >
                          {submitting.editTeacher ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Save Changes"
                          )}
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex gap-2 mb-4">
                      <Button variant="outline" onClick={() => fetchTeachers()}>
                        Refresh Teachers
                      </Button>
                    </div>

                    {loadingTeachers ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : teachers.length > 0 ? (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {teachers.map((t) => (
                          <div
                            key={t.id}
                            className="flex items-center justify-between p-3 border rounded-md bg-muted/40 hover:bg-muted/60 transition"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{t.name}</p>
                              <p className="text-xs text-muted-foreground truncate">ID: {t.employeeId}</p>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingTeacher(t);
                                  setEditTeacherForm({
                                    name: t.name,
                                    password: "",
                                    branchId: t.branchId?.toString() || "",
                                  });
                                }}
                                disabled={submitting.editTeacher || submitting.deleteTeacher}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  runDelete("deleteTeacher", `/api/admin/teacher/${t.id}`, () =>
                                    fetchTeachers()
                                  )
                                }
                                disabled={submitting.deleteTeacher || submitting.editTeacher}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No teachers found. Create one in the Add Teacher tab.</p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ================= MANAGE STUDENTS ================= */}
          <TabsContent value="manage-student">
            <Card className="shadow-sm border-border/70 bg-card/90 backdrop-blur">
              <CardHeader className="flex flex-col gap-2">
                <CardTitle>Manage Students</CardTitle>
                <p className="text-sm text-muted-foreground">View, edit, or delete existing students.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {editingStudent ? (
                  <>
                    <div className="p-4 border rounded-md bg-muted/40 space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">Edit Student: {editingStudent.roll}</h3>
                        <p className="text-sm text-muted-foreground mb-4">Update student details</p>
                      </div>

                      <Input
                        placeholder="Full Name"
                        value={editStudentForm.name}
                        onChange={(e) => setEditStudentForm({ ...editStudentForm, name: e.target.value })}
                      />

                      <Input
                        type="password"
                        placeholder="Password (leave empty to keep current)"
                        value={editStudentForm.password}
                        onChange={(e) => setEditStudentForm({ ...editStudentForm, password: e.target.value })}
                      />

                      <Select
                        value={editStudentForm.semester}
                        onValueChange={(v) => setEditStudentForm({ ...editStudentForm, semester: v })}
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
                        value={editStudentForm.branchId}
                        onValueChange={(v) => setEditStudentForm({ ...editStudentForm, branchId: v })}
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

                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setEditingStudent(null);
                            setEditStudentForm({ name: "", password: "", semester: "", branchId: "" });
                          }}
                          disabled={submitting.editStudent}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => {
                            if (!editStudentForm.name || !editStudentForm.semester || !editStudentForm.branchId) {
                              toast.error("Name, semester, and branch are required");
                              return;
                            }
                            runUpdate(
                              "editStudent",
                              `/api/admin/student/${editingStudent.id}`,
                              {
                                name: editStudentForm.name,
                                password: editStudentForm.password || undefined,
                                semester: Number(editStudentForm.semester),
                                branchId: Number(editStudentForm.branchId),
                              },
                              () => {
                                setEditingStudent(null);
                                setEditStudentForm({ name: "", password: "", semester: "", branchId: "" });
                                fetchStudents();
                              }
                            );
                          }}
                          disabled={submitting.editStudent}
                        >
                          {submitting.editStudent ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Save Changes"
                          )}
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex gap-2 mb-4">
                      <Button variant="outline" onClick={() => fetchStudents()}>
                        Refresh Students
                      </Button>
                    </div>

                    {loadingStudents ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : students.length > 0 ? (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {students.map((s) => (
                          <div
                            key={s.id}
                            className="flex items-center justify-between p-3 border rounded-md bg-muted/40 hover:bg-muted/60 transition"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{s.name}</p>
                              <p className="text-xs text-muted-foreground truncate">Roll: {s.roll} | Sem: {s.semester}</p>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingStudent(s);
                                  setEditStudentForm({
                                    name: s.name,
                                    password: "",
                                    semester: s.semester.toString(),
                                    branchId: s.branchId.toString(),
                                  });
                                }}
                                disabled={submitting.editStudent || submitting.deleteStudent}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  runDelete("deleteStudent", `/api/admin/student/${s.id}`, () =>
                                    fetchStudents()
                                  )
                                }
                                disabled={submitting.deleteStudent || submitting.editStudent}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No students found. Create one in the Add Student tab.</p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ================= MANAGE SUBJECTS ================= */}
          <TabsContent value="manage-subject">
            <Card className="shadow-sm border-border/70 bg-card/90 backdrop-blur">
              <CardHeader className="flex flex-col gap-2">
                <CardTitle>Manage Subjects</CardTitle>
                <p className="text-sm text-muted-foreground">View, edit, or delete existing subjects.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {editingSubject ? (
                  <>
                    <div className="p-4 border rounded-md bg-muted/40 space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">Edit Subject: {editingSubject.name}</h3>
                        <p className="text-sm text-muted-foreground mb-4">Update subject details</p>
                      </div>

                      <Input
                        placeholder="Subject Name"
                        value={editSubjectForm.name}
                        onChange={(e) => setEditSubjectForm({ ...editSubjectForm, name: e.target.value })}
                      />

                      <Select
                        value={editSubjectForm.semester}
                        onValueChange={(v) => setEditSubjectForm({ ...editSubjectForm, semester: v })}
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
                        value={editSubjectForm.branchId}
                        onValueChange={(v) => {
                          setEditSubjectForm({ ...editSubjectForm, branchId: v });
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
                        value={editSubjectForm.teacherId}
                        onValueChange={(v) => setEditSubjectForm({ ...editSubjectForm, teacherId: v })}
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

                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setEditingSubject(null);
                            setEditSubjectForm({ name: "", semester: "", branchId: "", teacherId: "" });
                          }}
                          disabled={submitting.editSubject}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => {
                            if (!editSubjectForm.name || !editSubjectForm.semester || !editSubjectForm.branchId || !editSubjectForm.teacherId) {
                              toast.error("All fields are required");
                              return;
                            }
                            runUpdate(
                              "editSubject",
                              `/api/admin/subject/${editingSubject.id}`,
                              {
                                name: editSubjectForm.name,
                                semester: Number(editSubjectForm.semester),
                                branchId: Number(editSubjectForm.branchId),
                                teacherId: Number(editSubjectForm.teacherId),
                              },
                              () => {
                                setEditingSubject(null);
                                setEditSubjectForm({ name: "", semester: "", branchId: "", teacherId: "" });
                                fetchSubjects();
                              }
                            );
                          }}
                          disabled={submitting.editSubject}
                        >
                          {submitting.editSubject ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Save Changes"
                          )}
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex gap-2 mb-4">
                      <Button variant="outline" onClick={() => fetchSubjects()}>
                        Refresh Subjects
                      </Button>
                    </div>

                    {loadingSubjects ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : subjects.length > 0 ? (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {subjects.map((s) => (
                          <div
                            key={s.id}
                            className="flex items-center justify-between p-3 border rounded-md bg-muted/40 hover:bg-muted/60 transition"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{s.name}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                Sem: {s.semester} | Teacher: {s.teachers[0]?.name || "Unassigned"}
                              </p>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingSubject(s);
                                  setEditSubjectForm({
                                    name: s.name,
                                    semester: s.semester.toString(),
                                    branchId: s.branchId.toString(),
                                    teacherId: s.teachers[0]?.id.toString() || "",
                                  });
                                  fetchTeachersByBranch(s.branchId.toString());
                                }}
                                disabled={submitting.editSubject || submitting.deleteSubject}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  runDelete("deleteSubject", `/api/admin/subject/${s.id}`, () =>
                                    fetchSubjects()
                                  )
                                }
                                disabled={submitting.deleteSubject || submitting.editSubject}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No subjects found. Create one in the Add Subject tab.</p>
                    )}
                  </>
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
