"use client";

import { useEffect, useState } from "react";
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

  /* ================= FETCH BRANCHES ================= */

  useEffect(() => {
    fetch("/api/admin/branches")
      .then((res) => res.json())
      .then((data) => setBranches(data.branches ?? []))
      .catch(() => toast.error("Failed to load branches"));
  }, []);

  /* ================= HELPERS ================= */

  const submit = async (url: string, payload: unknown) => {
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

    toast.success("Operation successful");
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

  /* ================= UI ================= */

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
      <h1 className="text-3xl font-semibold">Admin Dashboard</h1>

      <Tabs defaultValue="teacher">
        <TabsList>
          <TabsTrigger value="teacher">Add Teacher</TabsTrigger>
          <TabsTrigger value="student">Add Student</TabsTrigger>
          <TabsTrigger value="subject">Add Subject</TabsTrigger>
        </TabsList>

        {/* ================= ADD TEACHER ================= */}
        <TabsContent value="teacher">
          <Card>
            <CardHeader>
              <CardTitle>Add Teacher</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Employee ID"
                value={teacher.employeeId}
                onChange={(e) =>
                  setTeacher({ ...teacher, employeeId: e.target.value })
                }
              />

              <Input
                placeholder="Name"
                value={teacher.name}
                onChange={(e) =>
                  setTeacher({ ...teacher, name: e.target.value })
                }
              />

              <Input
                type="password"
                placeholder="Password"
                value={teacher.password}
                onChange={(e) =>
                  setTeacher({ ...teacher, password: e.target.value })
                }
              />

              <Select
                value={teacher.branchId}
                onValueChange={(v) =>
                  setTeacher({ ...teacher, branchId: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id.toString()}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                onClick={() =>
                  submit("/api/admin/teacher", {
                    ...teacher,
                    branchId: Number(teacher.branchId),
                  })
                }
              >
                Create Teacher
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================= ADD STUDENT ================= */}
        <TabsContent value="student">
          <Card>
            <CardHeader>
              <CardTitle>Add Student</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Roll Number"
                value={student.roll}
                onChange={(e) =>
                  setStudent({ ...student, roll: e.target.value })
                }
              />

              <Input
                placeholder="Name"
                value={student.name}
                onChange={(e) =>
                  setStudent({ ...student, name: e.target.value })
                }
              />

              <Input
                type="password"
                placeholder="Password"
                value={student.password}
                onChange={(e) =>
                  setStudent({ ...student, password: e.target.value })
                }
              />

              <Select
                value={student.semester}
                onValueChange={(v) =>
                  setStudent({ ...student, semester: v })
                }
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
                onValueChange={(v) =>
                  setStudent({ ...student, branchId: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id.toString()}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                onClick={() =>
                  submit("/api/admin/student", {
                    ...student,
                    semester: Number(student.semester),
                    branchId: Number(student.branchId),
                  })
                }
              >
                Create Student
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================= ADD SUBJECT ================= */}
        <TabsContent value="subject">
          <Card>
            <CardHeader>
              <CardTitle>Add Subject</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Subject Name"
                value={subject.name}
                onChange={(e) =>
                  setSubject({ ...subject, name: e.target.value })
                }
              />

              <Select
                value={subject.semester}
                onValueChange={(v) =>
                  setSubject({ ...subject, semester: v })
                }
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
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Branch" />
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
                onValueChange={(v) =>
                  setSubject({ ...subject, teacherId: v })
                }
                disabled={!branchTeachers.length}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Assign Teacher" />
                </SelectTrigger>
                <SelectContent>
                  {branchTeachers.map((t) => (
                    <SelectItem key={t.id} value={t.id.toString()}>
                      {t.name} ({t.employeeId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                disabled={!subject.teacherId}
                onClick={() =>
                  submit("/api/admin/subject", {
                    name: subject.name,
                    semester: Number(subject.semester),
                    branchId: Number(subject.branchId),
                    teacherId: Number(subject.teacherId),
                  })
                }
              >
                Create Subject
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
