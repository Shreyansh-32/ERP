"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import { useRouter } from "next/navigation";

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

export default function TeacherDashboard(){
  const { data: session } = useSession();
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);

  const [attendanceDate, setAttendanceDate] = useState<string>("");
  const [presentRolls, setPresentRolls] = useState<string[]>([]);

  const [ctMarks, setCtMarks] = useState<Record<number, number>>({});
  const [ctNumber, setCtNumber] = useState<number>(1);

  const [loadingSubjects, setLoadingSubjects] = useState<boolean>(true);
  const [loadingStudents, setLoadingStudents] = useState<boolean>(false);

  /* ------------------------- FETCH SUBJECTS ------------------------- */
  useEffect(() => {
    let isMounted = true;

    fetch("/api/teacher/subjects")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch subjects");
        const data = (await res.json()) as Subject[];
        if (isMounted) setSubjects(data);
      })
      .catch(() => toast.error("Could not load subjects"))
      .finally(() => {
        if (isMounted) setLoadingSubjects(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  /* ------------------------- FETCH STUDENTS ------------------------- */
  useEffect(() => {
    let isMounted = true;

    // Reset students safely OUTSIDE effect first

    if (!selectedSubject) return;

    const subject = subjects.find((s) => s.id === selectedSubject);
    if (!subject) return;

    fetch(
      `/api/teacher/students?branchId=${subject.branchId}&semester=${subject.semester}`
    )
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch students");
        const data = (await res.json()) as Student[];
        if (isMounted) setStudents(data);
      })
      .catch(() => toast.error("Could not load students"))
      .finally(() => {
        if (isMounted) setLoadingStudents(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedSubject, subjects]);

  /* ------------------------- Toggle Roll Checkbox ------------------------- */
  const handleCheckboxChange = (checked: boolean | string, roll: string) => {
    if (checked === true) {
      setPresentRolls((prev) => [...prev, roll]);
    } else {
      setPresentRolls((prev) => prev.filter((r) => r !== roll));
    }
  };

  /* ------------------------- Submit Attendance ------------------------- */
  const submitAttendance = async () => {
    if (!selectedSubject || !attendanceDate) {
      toast.error("Select subject and date");
      return;
    }

    try {
      const res = await fetch("/api/teacher/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: selectedSubject,
          date: attendanceDate,
          presentRolls,
        }),
      });

      if (!res.ok) return toast.error("Failed to save attendance");

      toast.success("Attendance saved!");

      // Fully reset UI
      setPresentRolls([]);
      setAttendanceDate("");
      setStudents([]);
      setSelectedSubject(null);
      router.refresh();
    } catch {
      toast.error("Error marking attendance");
    }
  };

  /* ------------------------- Submit CT Marks ------------------------- */
  const submitCT = async () => {
    if (!selectedSubject) {
      toast.error("Select a subject");
      return;
    }

    const marksArray = students.map((s) => ({
      studentId: s.id,
      marks: Number(ctMarks[s.id] || 0),
      semester: s.semester,
      branchId: s.branchId,
    }));

    try {
      const res = await fetch("/api/teacher/ct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: selectedSubject,
          ctNumber,
          marks: marksArray,
        }),
      });

      if (!res.ok) return toast.error("Failed to save CT marks");

      toast.success("CT marks saved!");
      setCtMarks({});
    } catch {
      toast.error("Error saving CT marks");
    }
  };

  /* ------------------------- Render UI ------------------------- */
  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      <h1 className="text-3xl font-semibold">Teacher Dashboard</h1>

      <Tabs defaultValue="attendance" className="space-y-6">
        <TabsList>
          <TabsTrigger value="attendance">Mark Attendance</TabsTrigger>
          <TabsTrigger value="ct">Assign CT Marks</TabsTrigger>
        </TabsList>

        {/* ---------------- ATTENDANCE TAB ---------------- */}
        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>Mark Attendance</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Select Subject */}
              <div>
                <label className="text-sm font-medium">Subject</label>
                <Select
                  onValueChange={(v) => setSelectedSubject(Number(v))}
                  value={selectedSubject?.toString()}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        loadingSubjects ? "Loading..." : "Select a subject"
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

              {/* Date */}
              <div>
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                />
              </div>

              {/* Students List */}
              {loadingStudents ? (
                <div>Loading students...</div>
              ) : students.length > 0 ? (
                <div className="space-y-4">
                  {students.map((s) => (
                    <div key={s.id} className="flex items-center gap-3">
                      <Checkbox
                        checked={presentRolls.includes(s.roll)}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(checked, s.roll)
                        }
                      />
                      <span>
                        {s.roll} — {s.name}
                      </span>
                    </div>
                  ))}

                  <Button onClick={submitAttendance}>Save Attendance</Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No students found.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------- CT MARKS TAB ---------------- */}
        <TabsContent value="ct">
          <Card>
            <CardHeader>
              <CardTitle>Assign CT Marks</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Subject */}
              <div>
                <label className="text-sm font-medium">Subject</label>
                <Select
                  onValueChange={(v) => setSelectedSubject(Number(v))}
                  value={selectedSubject?.toString()}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => (
                      <SelectItem key={s.id} value={s.id.toString()}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* CT Number */}
              <div>
                <label className="text-sm font-medium">CT Number</label>
                <Select
                  onValueChange={(v) => setCtNumber(Number(v))}
                  value={ctNumber.toString()}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select CT" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">CT 1</SelectItem>
                    <SelectItem value="2">CT 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Students Enter Marks */}
              {students.length > 0 && (
                <div className="space-y-4">
                  {students.map((s) => (
                    <div key={s.id} className="flex items-center gap-3">
                      <div className="w-36">
                        {s.roll} — {s.name}
                      </div>
                      <Input
                        type="number"
                        value={ctMarks[s.id] ?? ""}
                        className="w-24"
                        onChange={(e) =>
                          setCtMarks((prev) => ({
                            ...prev,
                            [s.id]: Number(e.target.value),
                          }))
                        }
                      />
                    </div>
                  ))}

                  <Button onClick={submitCT}>Save CT Marks</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
