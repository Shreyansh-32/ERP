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
  const [ctMarks, setCtMarks] = useState<Record<number, number>>({});

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
      marks: Number(ctMarks[s.id] ?? 0),
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
  /*                     CSV EXPORT                            */
  /* ========================================================= */
  const exportAttendanceCSV = () => {
    if (!selectedSubject || !attendanceDate) {
      toast.error("Select subject and date");
      return;
    }

    window.open(
      `/api/teacher/attendance/export?subjectId=${selectedSubject}&date=${attendanceDate}`,
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

  /* ========================================================= */
  /*                           UI                              */
  /* ========================================================= */
  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      <h1 className="text-3xl font-semibold">Teacher Dashboard</h1>

      <Tabs defaultValue="attendance">
        <TabsList>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="ct" disabled={!selectedSubject}>
            CT Marks
          </TabsTrigger>
        </TabsList>

        {/* ================= ATTENDANCE ================= */}
        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>Mark Attendance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Select
                value={selectedSubject?.toString()}
                onValueChange={(v) => {
                  setSelectedSubject(Number(v));
                  setStudents([]);
                  setPresentRolls([]);
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

              <Input
                type="date"
                max={new Date().toISOString().split("T")[0]}
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
              />

              {attendanceExists && (
                <div className="rounded-md border border-yellow-400 bg-background px-4 py-2 text-sm">
                  Attendance already exists (editing mode)
                </div>
              )}

              {loadingStudents ? (
                <p>Loading students…</p>
              ) : (
                students.map((s) => (
                  <div key={s.id} className="flex items-center gap-3">
                    <Checkbox
                      checked={presentRolls.includes(s.roll)}
                      onCheckedChange={(checked) =>
                        toggleRoll(s.roll, Boolean(checked))
                      }
                    />
                    <span>
                      {s.roll} — {s.name}
                    </span>
                  </div>
                ))
              )}

              <div className="flex gap-3">
                <Button onClick={submitAttendance} disabled={!students.length}>
                  Save Attendance
                </Button>
                <Button
                  variant="outline"
                  onClick={exportAttendanceCSV}
                  disabled={!attendanceExists}
                >
                  Export CSV
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================= CT MARKS ================= */}
        <TabsContent value="ct">
          <Card>
            <CardHeader>
              <CardTitle>Assign CT Marks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Select
                value={ctNumber.toString()}
                onValueChange={(v) => setCtNumber(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select CT" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">CT 1</SelectItem>
                  <SelectItem value="2">CT 2</SelectItem>
                </SelectContent>
              </Select>

              {Object.keys(ctMarks).length > 0 && (
                <div className="rounded-md border border-blue-400 bg-background px-4 py-2 text-sm">
                  Existing CT marks loaded (editing mode)
                </div>
              )}

              {students.map((s) => (
                <div key={s.id} className="flex items-center gap-3">
                  <div className="w-40">
                    {s.roll} — {s.name}
                  </div>
                  <Input
                    type="number"
                    className="w-24"
                    value={ctMarks[s.id] ?? ""}
                    onChange={(e) =>
                      setCtMarks((prev) => ({
                        ...prev,
                        [s.id]: Number(e.target.value),
                      }))
                    }
                  />
                </div>
              ))}

              <div className="flex gap-3">
                <Button onClick={submitCT} disabled={!students.length}>
                  Save CT Marks
                </Button>
                <Button
                  variant="outline"
                  onClick={exportCTCSV}
                  disabled={!students.length}
                >
                  Export CSV
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
