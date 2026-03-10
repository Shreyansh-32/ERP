"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle2, XCircle } from "lucide-react";

/* ================= TYPES ================= */

type Subject = {
  id: number;
  name: string;
  semester: number;
  branchId: number;
};

type Student = {
  id: number;
  roll: string;
  name: string;
  semester: number;
  branchId: number;
};

/* ================= COMPONENT ================= */

export default function TeacherDashboard() {
  const router = useRouter();

  /* ---------- Core State ---------- */
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);

  /* ---------- Attendance ---------- */
  const [attendanceDate, setAttendanceDate] = useState("");
  const [presentRolls, setPresentRolls] = useState<string[]>([]);
  const [attendanceExists, setAttendanceExists] = useState(false);

  /* ---------- CT Marks ---------- */
  const [ctNumber, setCtNumber] = useState<number>(1);
  const [ctMarks, setCtMarks] = useState<Record<number, number | undefined>>({});

  /* ---------- Assignments ---------- */
  const [assignmentNumber, setAssignmentNumber] = useState<number>(1);
  const [assignmentSubmitted, setAssignmentSubmitted] = useState<Record<number, boolean>>({});

  /* ---------- Quiz ---------- */
  const [quizNumber, setQuizNumber] = useState<number>(1);
  const [quizMarks, setQuizMarks] = useState<Record<number, number | undefined>>({});
  const [quizPresent, setQuizPresent] = useState<Record<number, boolean>>({});

  /* ---------- Loading ---------- */
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);

  /* ========================================================= */
  /*                    FETCH SUBJECTS                         */
  /* ========================================================= */
  useEffect(() => {
    let alive = true;

    fetch("/api/teacher/subjects")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data: Subject[]) => {
        if (alive) setSubjects(data);
      })
      .catch(() => toast.error("Failed to load subjects"))
      .finally(() => {
        if (alive) setLoadingSubjects(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  /* ========================================================= */
  /*                    FETCH STUDENTS                         */
  /* ========================================================= */
  useEffect(() => {
    if (!selectedSubject) return;

    const subject = subjects.find((s) => s.id === selectedSubject);
    if (!subject) return;

    let alive = true;

    fetch(
      `/api/teacher/students?branchId=${subject.branchId}&semester=${subject.semester}`
    )
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data: Student[]) => {
        if (alive) setStudents(data);
      })
      .catch(() => toast.error("Failed to load students"))
      .finally(() => {
        if (alive) setLoadingStudents(false);
      });

    return () => {
      alive = false;
    };
  }, [selectedSubject, subjects]);

  /* ========================================================= */
  /*           PREFILL ATTENDANCE (EDIT MODE)                  */
  /* ========================================================= */
  useEffect(() => {
    if (!selectedSubject || !attendanceDate) return;

    fetch(
      `/api/teacher/attendance/check?subjectId=${selectedSubject}&date=${attendanceDate}`
    )
      .then((res) => res.json())
      .then((data) => {
        setAttendanceExists(Boolean(data.exists));
        setPresentRolls(data.presentRolls ?? []);
      })
      .catch(() => {
        setAttendanceExists(false);
        setPresentRolls([]);
      });
  }, [selectedSubject, attendanceDate]);

  /* ========================================================= */
  /*              PREFILL CT MARKS (EDIT MODE)                 */
  /* ========================================================= */
  useEffect(() => {
    if (!selectedSubject || !ctNumber) return;

    fetch(
      `/api/teacher/ct/get?subjectId=${selectedSubject}&ctNumber=${ctNumber}`
    )
      .then((res) => res.json())
      .then((data) => {
        const filled: Record<number, number> = {};
        for (const m of data.marks ?? []) {
          filled[m.studentId] = m.marks;
        }
        setCtMarks(filled);
      })
      .catch(() => setCtMarks({}));
  }, [selectedSubject, ctNumber]);

  /* ========================================================= */
  /*           PREFILL ASSIGNMENTS (EDIT MODE)                 */
  /* ========================================================= */
  useEffect(() => {
    if (!selectedSubject || !assignmentNumber) return;

    fetch(
      `/api/teacher/assignment/get?subjectId=${selectedSubject}&assignmentNumber=${assignmentNumber}`
    )
      .then((res) => res.json())
      .then((data) => {
        const map: Record<number, boolean> = {};
        for (const s of data.submissions ?? []) {
          map[s.studentId] = Boolean(s.submitted);
        }
        setAssignmentSubmitted(map);
      })
      .catch(() => setAssignmentSubmitted({}));
  }, [selectedSubject, assignmentNumber]);

  /* ========================================================= */
  /*             PREFILL QUIZ (EDIT MODE)                      */
  /* ========================================================= */
  useEffect(() => {
    if (!selectedSubject || !quizNumber) return;

    fetch(`/api/teacher/quiz/get?subjectId=${selectedSubject}&quizNumber=${quizNumber}`)
      .then((res) => res.json())
      .then((data) => {
        const marks: Record<number, number | undefined> = {};
        const present: Record<number, boolean> = {};
        for (const r of data.records ?? []) {
          marks[r.studentId] = r.marks ?? undefined;
          present[r.studentId] = Boolean(r.present);
        }
        setQuizMarks(marks);
        setQuizPresent(present);
      })
      .catch(() => {
        setQuizMarks({});
        setQuizPresent({});
      });
  }, [selectedSubject, quizNumber]);

  /* ========================================================= */
  /*                   ATTENDANCE HANDLERS                     */
  /* ========================================================= */
  const toggleRoll = (roll: string, checked: boolean) => {
    setPresentRolls((prev) =>
      checked ? [...prev, roll] : prev.filter((r) => r !== roll)
    );
  };

  const submitAttendance = async () => {
    if (!selectedSubject || !attendanceDate) {
      toast.error("Select subject and date");
      return;
    }

    const res = await fetch("/api/teacher/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subjectId: selectedSubject,
        date: attendanceDate,
        presentRolls,
      }),
    });

    if (!res.ok) {
      toast.error("Failed to save attendance");
      return;
    }

    toast.success("Attendance saved");

    // Reset UI
    setSelectedSubject(null);
    setAttendanceDate("");
    setPresentRolls([]);
    setStudents([]);
    setAttendanceExists(false);

    router.refresh();
  };

  /* ========================================================= */
  /*                     CT HANDLERS                           */
  /* ========================================================= */
  const submitCT = async () => {
    if (!selectedSubject) {
      toast.error("Select subject");
      return;
    }

    const payload = students.map((s) => ({
      studentId: s.id,
      marks: Math.min(20, Number(ctMarks[s.id] ?? 0)),
      semester: s.semester,
      branchId: s.branchId,
    }));

    const res = await fetch("/api/teacher/ct", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subjectId: selectedSubject,
        ctNumber,
        marks: payload,
      }),
    });

    if (!res.ok) {
      toast.error("Failed to save CT marks");
      return;
    }

    toast.success("CT marks saved");
  };

  /* ========================================================= */
  /*                  ASSIGNMENT HANDLERS                      */
  /* ========================================================= */
  const toggleAssignment = (studentId: number) => {
    setAssignmentSubmitted((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const submitAssignment = async () => {
    if (!selectedSubject) {
      toast.error("Select subject");
      return;
    }

    const submissions = students.map((s) => ({
      studentId: s.id,
      submitted: Boolean(assignmentSubmitted[s.id]),
      semester: s.semester,
      branchId: s.branchId,
    }));

    const res = await fetch("/api/teacher/assignment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subjectId: selectedSubject,
        assignmentNumber,
        submissions,
      }),
    });

    if (!res.ok) {
      toast.error("Failed to save assignments");
      return;
    }

    toast.success("Assignments updated");
  };

  /* ========================================================= */
  /*                     QUIZ HANDLERS                         */
  /* ========================================================= */
  const submitQuiz = async () => {
    if (!selectedSubject) {
      toast.error("Select subject");
      return;
    }

    const records = students.map((s) => ({
      studentId: s.id,
      marks: quizMarks[s.id] ?? null,
      present: Boolean(quizPresent[s.id]),
      semester: s.semester,
      branchId: s.branchId,
    }));

    const res = await fetch("/api/teacher/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subjectId: selectedSubject,
        quizNumber,
        records,
      }),
    });

    if (!res.ok) {
      toast.error("Failed to save quiz data");
      return;
    }

    toast.success("Quiz data saved");
  };

  /* ========================================================= */
  /*                     CSV EXPORT                            */
  /* ========================================================= */
  const exportAttendanceCSV = () => {
    if (!selectedSubject) {
      toast.error("Select subject");
      return;
    }

    window.open(
      `/api/teacher/attendance/export?subjectId=${selectedSubject}`,
      "_blank"
    );
  };

  const exportCTCSV = () => {
    if (!selectedSubject) {
      toast.error("Select subject");
      return;
    }

    window.open(
      `/api/teacher/ct/export?subjectId=${selectedSubject}&ctNumber=${ctNumber}`,
      "_blank"
    );
  };

  const exportAllCTCSV = () => {
    if (!selectedSubject) {
      toast.error("Select subject");
      return;
    }

    window.open(
      `/api/teacher/ct/export/all?subjectId=${selectedSubject}`,
      "_blank"
    );
  };

  const exportAssignmentCSV = () => {
    if (!selectedSubject) {
      toast.error("Select subject");
      return;
    }

    window.open(
      `/api/teacher/assignment/export?subjectId=${selectedSubject}&assignmentNumber=${assignmentNumber}`,
      "_blank"
    );
  };

  const exportAllAssignmentsCSV = () => {
    if (!selectedSubject) {
      toast.error("Select subject");
      return;
    }

    window.open(
      `/api/teacher/assignment/export/all?subjectId=${selectedSubject}`,
      "_blank"
    );
  };

  const exportQuizCSV = () => {
    if (!selectedSubject) {
      toast.error("Select subject");
      return;
    }

    window.open(
      `/api/teacher/quiz/export?subjectId=${selectedSubject}&quizNumber=${quizNumber}`,
      "_blank"
    );
  };

  const exportAllQuizCSV = () => {
    if (!selectedSubject) {
      toast.error("Select subject");
      return;
    }

    window.open(
      `/api/teacher/quiz/export/all?subjectId=${selectedSubject}`,
      "_blank"
    );
  };

  const subjectMeta = subjects.find((s) => s.id === selectedSubject);
  const totalStudents = students.length;
  const presentCount = presentRolls.length;
  const absentCount = Math.max(totalStudents - presentCount, 0);

  /* ========================================================= */
  /*                           UI                              */
  /* ========================================================= */
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-background via-background to-muted/40">
      <div className="pointer-events-none absolute inset-x-0 -top-16 -z-10 h-56 bg-gradient-to-r from-sky-500/20 via-indigo-500/10 to-purple-500/10 blur-3xl" />
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Teacher</p>
            <h1 className="text-3xl font-semibold tracking-tight">Teacher Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Manage attendance and CT marks with a calmer, cleaner flow.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={exportAttendanceCSV} disabled={!selectedSubject}>
              Export Attendance
            </Button>
            <Button variant="secondary" onClick={exportAllCTCSV} disabled={!selectedSubject}>
              Export CT (All)
            </Button>
            <Button variant="outline" onClick={exportAllAssignmentsCSV} disabled={!selectedSubject}>
              Export Assignments
            </Button>
            <Button variant="ghost" onClick={exportAllQuizCSV} disabled={!selectedSubject}>
              Export Quiz (All)
            </Button>
          </div>
        </div>

        <Card className="border-dashed shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary">Subject</Badge>
              <div className="text-lg font-semibold">
                {subjectMeta ? `${subjectMeta.name} (Sem ${subjectMeta.semester})` : "Pick a subject to begin"}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {subjectMeta
                ? `Branch ${subjectMeta.branchId} · Semester ${subjectMeta.semester}`
                : "Select a subject to load students and records."}
            </p>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Students", value: totalStudents || "—" },
              { label: "Present (today)", value: presentCount || "—" },
              { label: "Absent (today)", value: totalStudents ? absentCount : "—" },
              {
                label: "Attendance mode",
                value: attendanceExists ? "Editing existing" : "New entry",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border bg-card/50 px-4 py-3 shadow-[0_1px_0_rgba(0,0,0,0.04)]"
              >
                <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
                  {stat.label}
                </p>
                <p className="text-xl font-semibold">{stat.value}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Tabs defaultValue="attendance" className="space-y-4">
          <TabsList className="w-full justify-start gap-2 rounded-xl bg-muted/60 p-1">
            <TabsTrigger value="attendance" className="flex-1 rounded-lg">
              Attendance
            </TabsTrigger>
            <TabsTrigger value="ct" disabled={!selectedSubject} className="flex-1 rounded-lg">
              CT Marks
            </TabsTrigger>
            <TabsTrigger value="assignment" disabled={!selectedSubject} className="flex-1 rounded-lg">
              Assignments
            </TabsTrigger>
            <TabsTrigger value="quiz" disabled={!selectedSubject} className="flex-1 rounded-lg">
              Quiz
            </TabsTrigger>
          </TabsList>

          <TabsContent value="attendance" className="space-y-4">
            <Card className="shadow-sm">
              <CardHeader className="gap-2">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">Step 1</Badge>
                  <CardTitle>Mark Attendance</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">
                  Choose subject and date, then tick who is present. Export always includes the full roster.
                </p>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Select
                      value={selectedSubject?.toString()}
                      onValueChange={(v) => {
                        setSelectedSubject(Number(v));
                        setStudents([]);
                        setPresentRolls([]);
                        setCtMarks({});
                        setAssignmentSubmitted({});
                        setQuizMarks({});
                        setQuizPresent({});
                        setAttendanceExists(false);
                        setLoadingStudents(true);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            loadingSubjects
                              ? "Loading subjects..."
                              : "Select subject"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((s) => (
                          <SelectItem key={s.id} value={s.id.toString()}>
                            {s.name} (Sem {s.semester})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      max={new Date().toISOString().split("T")[0]}
                      value={attendanceDate}
                      onChange={(e) => setAttendanceDate(e.target.value)}
                    />
                  </div>
                </div>

                {attendanceExists && (
                  <div className="rounded-lg border border-amber-400/60 bg-amber-50 px-4 py-2 text-sm text-amber-900">
                    Editing attendance already saved for this date. Changes overwrite prior marks.
                  </div>
                )}

                <div className="rounded-lg border bg-card">
                  <div className="flex items-center justify-between border-b px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">Students</p>
                      <p className="text-xs text-muted-foreground">
                        Click the checkbox to mark present. Blank means absent.
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {presentCount}/{totalStudents || 0} present
                    </div>
                  </div>

                  {loadingStudents ? (
                    <div className="px-4 py-10 text-sm text-muted-foreground">Loading students…</div>
                  ) : !students.length ? (
                    <div className="px-4 py-10 text-sm text-muted-foreground">
                      Select a subject to load students.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-24">Present</TableHead>
                          <TableHead>Roll</TableHead>
                          <TableHead>Name</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.map((s) => {
                          const checked = presentRolls.includes(s.roll);
                          return (
                            <TableRow key={s.id} className="cursor-pointer">
                              <TableCell className="w-24">
                                <Checkbox
                                  checked={checked}
                                  onCheckedChange={(state) =>
                                    toggleRoll(s.roll, Boolean(state))
                                  }
                                  aria-label={`Mark ${s.roll} present`}
                                />
                              </TableCell>
                              <TableCell className="font-medium">{s.roll}</TableCell>
                              <TableCell>{s.name}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </div>

                <Separator />

                <div className="flex flex-wrap gap-3">
                  <Button onClick={submitAttendance} disabled={!students.length || !attendanceDate}>
                    Save Attendance
                  </Button>
                  <Button variant="outline" onClick={exportAttendanceCSV} disabled={!selectedSubject}>
                    Export CSV
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ct" className="space-y-4">
            <Card className="shadow-sm">
              <CardHeader className="gap-2">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">Step 2</Badge>
                  <CardTitle>Assign CT Marks</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">
                  Pick the CT, then enter marks. Missing marks stay blank in exports.
                </p>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>CT Number</Label>
                    <Select value={ctNumber.toString()} onValueChange={(v) => setCtNumber(Number(v))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select CT" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">CT 1</SelectItem>
                        <SelectItem value="2">CT 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Select
                      value={selectedSubject?.toString()}
                      onValueChange={(v) => {
                        setSelectedSubject(Number(v));
                        setStudents([]);
                        setCtMarks({});
                        setPresentRolls([]);
                        setAttendanceExists(false);
                        setAttendanceDate("");
                        setAssignmentSubmitted({});
                        setQuizMarks({});
                        setQuizPresent({});
                        setLoadingStudents(true);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={loadingSubjects ? "Loading subjects..." : "Select subject"} />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((s) => (
                          <SelectItem key={s.id} value={s.id.toString()}>
                            {s.name} (Sem {s.semester})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {Object.keys(ctMarks).length > 0 && (
                  <div className="rounded-lg border border-blue-400/60 bg-blue-50 px-4 py-2 text-sm text-blue-900">
                    Existing CT marks loaded; edits will update them.
                  </div>
                )}

                <div className="rounded-lg border bg-card">
                  <div className="flex items-center justify-between border-b px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">Students</p>
                      <p className="text-xs text-muted-foreground">
                        Leave blank for missing marks; exported rows keep blanks.
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">CT {ctNumber}</div>
                  </div>

                  {!students.length ? (
                    <div className="px-4 py-10 text-sm text-muted-foreground">
                      Select a subject to load students.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-32">Roll</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead className="w-32 text-right">Marks</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.map((s) => (
                          <TableRow key={s.id}>
                            <TableCell className="font-medium">{s.roll}</TableCell>
                            <TableCell>{s.name}</TableCell>
                            <TableCell className="text-right">
                              <Input
                                type="number"
                                className="w-24 ml-auto text-right appearance-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                inputMode="numeric"
                                value={ctMarks[s.id] ?? ""}
                                onChange={(e) => {
                                  const raw = e.target.value;
                                  if (raw === "") {
                                    setCtMarks((prev) => ({ ...prev, [s.id]: undefined }));
                                    return;
                                  }
                                  const num = Number(raw);
                                  if (Number.isNaN(num)) return;
                                  const clamped = Math.min(20, num);
                                  setCtMarks((prev) => ({ ...prev, [s.id]: clamped }));
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>

                <Separator />

                <div className="flex flex-wrap gap-3">
                  <Button onClick={submitCT} disabled={!students.length}>
                    Save CT Marks
                  </Button>
                  <Button variant="outline" onClick={exportCTCSV} disabled={!students.length}>
                    Export CSV
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assignment" className="space-y-4">
            <Card className="shadow-sm">
              <CardHeader className="gap-2">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">Step 3</Badge>
                  <CardTitle>Track Assignments</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">
                  Two assignments per subject. Toggle submitted status; blanks mean not submitted.
                </p>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Assignment</Label>
                    <Select value={assignmentNumber.toString()} onValueChange={(v) => setAssignmentNumber(Number(v))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select assignment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Assignment 1</SelectItem>
                        <SelectItem value="2">Assignment 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Select
                      value={selectedSubject?.toString()}
                      onValueChange={(v) => {
                        setSelectedSubject(Number(v));
                        setStudents([]);
                        setAssignmentSubmitted({});
                        setCtMarks({});
                        setQuizMarks({});
                        setQuizPresent({});
                        setPresentRolls([]);
                        setAttendanceExists(false);
                        setAttendanceDate("");
                        setLoadingStudents(true);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={loadingSubjects ? "Loading subjects..." : "Select subject"} />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((s) => (
                          <SelectItem key={s.id} value={s.id.toString()}>
                            {s.name} (Sem {s.semester})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {Object.keys(assignmentSubmitted).length > 0 && (
                  <div className="rounded-lg border border-emerald-400/60 bg-emerald-50 px-4 py-2 text-sm text-emerald-900">
                    Existing submission status loaded; toggling updates it.
                  </div>
                )}

                <div className="rounded-lg border bg-card">
                  <div className="flex items-center justify-between border-b px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">Students</p>
                      <p className="text-xs text-muted-foreground">Click the check to mark submitted. Blank = not submitted.</p>
                    </div>
                    <div className="text-xs text-muted-foreground">Assignment {assignmentNumber}</div>
                  </div>

                  {!students.length ? (
                    <div className="px-4 py-10 text-sm text-muted-foreground">Select a subject to load students.</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-32">Submitted</TableHead>
                          <TableHead>Roll</TableHead>
                          <TableHead>Name</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.map((s) => {
                          const submitted = Boolean(assignmentSubmitted[s.id]);
                          return (
                            <TableRow key={s.id}>
                              <TableCell className="w-32">
                                <Button
                                  type="button"
                                  variant={submitted ? "secondary" : "outline"}
                                  size="icon"
                                  onClick={() => toggleAssignment(s.id)}
                                  aria-pressed={submitted}
                                  aria-label={`Toggle submission for ${s.roll}`}
                                >
                                  {submitted ? (
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                  ) : (
                                    <XCircle className="h-4 w-4 text-rose-500" />
                                  )}
                                </Button>
                              </TableCell>
                              <TableCell className="font-medium">{s.roll}</TableCell>
                              <TableCell>{s.name}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </div>

                <Separator />

                <div className="flex flex-wrap gap-3">
                  <Button onClick={submitAssignment} disabled={!students.length}>
                    Save Assignments
                  </Button>
                  <Button variant="outline" onClick={exportAssignmentCSV} disabled={!students.length}>
                    Export CSV
                  </Button>
                  <Button variant="ghost" onClick={exportAllAssignmentsCSV} disabled={!students.length}>
                    Export All Assignments
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quiz" className="space-y-4">
            <Card className="shadow-sm">
              <CardHeader className="gap-2">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">Step 4</Badge>
                  <CardTitle>Quiz Marks</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">
                  Two quizzes per subject. Track marks and presence; blanks stay blank in exports.
                </p>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Quiz</Label>
                    <Select value={quizNumber.toString()} onValueChange={(v) => setQuizNumber(Number(v))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select quiz" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Quiz 1</SelectItem>
                        <SelectItem value="2">Quiz 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Select
                      value={selectedSubject?.toString()}
                      onValueChange={(v) => {
                        setSelectedSubject(Number(v));
                        setStudents([]);
                        setQuizMarks({});
                        setQuizPresent({});
                        setCtMarks({});
                        setAssignmentSubmitted({});
                        setPresentRolls([]);
                        setAttendanceExists(false);
                        setAttendanceDate("");
                        setLoadingStudents(true);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={loadingSubjects ? "Loading subjects..." : "Select subject"} />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((s) => (
                          <SelectItem key={s.id} value={s.id.toString()}>
                            {s.name} (Sem {s.semester})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {Object.keys(quizMarks).length > 0 && (
                  <div className="rounded-lg border border-indigo-400/60 bg-indigo-50 px-4 py-2 text-sm text-indigo-900">
                    Existing quiz data loaded; edits will update it.
                  </div>
                )}

                <div className="rounded-lg border bg-card">
                  <div className="flex items-center justify-between border-b px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">Students</p>
                      <p className="text-xs text-muted-foreground">Enter marks and presence. Blank marks stay blank in CSV.</p>
                    </div>
                    <div className="text-xs text-muted-foreground">Quiz {quizNumber}</div>
                  </div>

                  {!students.length ? (
                    <div className="px-4 py-10 text-sm text-muted-foreground">Select a subject to load students.</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-28">Roll</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead className="w-28 text-right">Marks</TableHead>
                          <TableHead className="w-32 text-right">Present</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.map((s) => {
                          const present = Boolean(quizPresent[s.id]);
                              return ( 
                                <TableRow key={s.id}> 
                                  <TableCell className="font-medium">{s.roll}</TableCell> 
                                  <TableCell>{s.name}</TableCell> 
                                  <TableCell className="text-right"> 
                                    <Input 
                                      type="number" 
                                      className="w-24 ml-auto text-right appearance-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" 
                                      inputMode="numeric" 
                                      value={quizMarks[s.id] ?? ""} 
                                      onChange={(e) => { 
                                        const raw = e.target.value; 
                                        if (raw === "") { 
                                          setQuizMarks((prev) => ({ ...prev, [s.id]: undefined })); 
                                          return; 
                                        } 
                                        const num = Number(raw); 
                                        if (Number.isNaN(num)) return; 
                                        const clamped = Math.min(20, num); 
                                        setQuizMarks((prev) => ({ ...prev, [s.id]: clamped })); 
                                      }} 
                                    /> 
                                  </TableCell> 
                                  <TableCell className="text-right pr-6"> 
                                    <div className="flex justify-end"> 
                                      <Checkbox 
                                        checked={present} 
                                        onCheckedChange={(state) => 
                                          setQuizPresent((prev) => ({ 
                                            ...prev, 
                                            [s.id]: Boolean(state), 
                                          })) 
                                        } 
                                        aria-label={`Mark ${s.roll} present for quiz`} 
                                      /> 
                                    </div> 
                                  </TableCell> 
                                </TableRow> 
                              ); 
                        })}
                      </TableBody>
                    </Table>
                  )}
                </div>

                <Separator />

                <div className="flex flex-wrap gap-3">
                  <Button onClick={submitQuiz} disabled={!students.length}>
                    Save Quiz
                  </Button>
                  <Button variant="outline" onClick={exportQuizCSV} disabled={!students.length}>
                    Export CSV
                  </Button>
                  <Button variant="ghost" onClick={exportAllQuizCSV} disabled={!students.length}>
                    Export All Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
