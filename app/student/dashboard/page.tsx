// /app/student/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import React from "react";

/* ShadCN UI components (adjust paths if your project differs) */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

/* Small table using shadcn table or simple markup */
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { authOptions } from "@/lib/authOptions";

/* Utility to format percentages & dates */
const percent = (num: number, den: number) => (den === 0 ? 0 : Math.round((num / den) * 100));

type AttendanceStat = {
  subjectId: number;
  subjectName: string;
  presentCount: number;
  totalClasses: number;
  percentage: number;
};

type StudentCT = {
  subjectId: number;
  subjectName: string;
  ctNumber: number;
  marks: number;
};

export default async function StudentDashboardPage() {
  // get session on server
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    // not authenticated
    redirect("/login");
  }

  if (session.user.role !== "student") {
    // not authorized for this page
    // optionally redirect based on role
    if (session.user.role === "teacher") redirect("/teacher/dashboard");
    if (session.user.role === "admin") redirect("/admin/dashboard");
    // otherwise show not found
    notFound();
  }

  const roll = session.user.identifier;
  if (!roll) return notFound();

  // fetch student with attendance and CTs
  const student = await prisma.student.findUnique({
    where: { roll },
    include: {
      branch: true,
      attendance: {
        include: { subject: true },
      },
      ctMarks: {
        include: { subject: true },
      },
    },
  });

  if (!student) return notFound();

  // Compute attendance stats per subject:
  // For each subject present in student's attendance records, compute:
  // presentCount = number of attendance rows for that student & subject
  // totalClasses = number of distinct dates in attendance table for that subject (across students)
  // percentage = presentCount / totalClasses * 100
  const attendanceBySubject = new Map<number, AttendanceStat>();

  for (const att of student.attendance) {
    const sid = att.subjectId;
    const subjName = att.subject?.name ?? "Unknown";

    const existing = attendanceBySubject.get(sid);
    if (existing) {
      existing.presentCount += 1;
      attendanceBySubject.set(sid, existing);
    } else {
      attendanceBySubject.set(sid, {
        subjectId: sid,
        subjectName: subjName,
        presentCount: 1,
        totalClasses: 0,
        percentage: 0,
      });
    }
  }

  // For each subject we have to compute total distinct class dates.
  // We'll query prisma.attendance.findMany with distinct on date for each subject id.
  // (Prisma supports distinct array)
  for (const [sid, stat] of attendanceBySubject) {
    const distinctDates = await prisma.attendance.findMany({
      where: { subjectId: sid },
      distinct: ["date"],
      select: { date: true },
    });
    stat.totalClasses = distinctDates.length;
    stat.percentage = percent(stat.presentCount, stat.totalClasses);
    attendanceBySubject.set(sid, stat);
  }

  const attendanceStats = Array.from(attendanceBySubject.values()).sort((a, b) =>
    a.subjectName.localeCompare(b.subjectName)
  );

  // CT marks: map them into an ordered list grouped by subject
  const ctList: StudentCT[] = student.ctMarks
    .map((ct) => ({
      subjectId: ct.subjectId,
      subjectName: ct.subject?.name ?? "Unknown",
      ctNumber: ct.ctNumber,
      marks: ct.marks,
    }))
    .sort((a, b) => {
      if (a.subjectName === b.subjectName) return a.ctNumber - b.ctNumber;
      return a.subjectName.localeCompare(b.subjectName);
    });

  // Optional: If a student has no attendance records yet, we might want to show subjects from branch+semester.
  // Fetch all subjects for student's branch & semester to show missing ones as 0%
  const subjectsForTerm = await prisma.subject.findMany({
    where: {
      branchId: student.branchId,
      semester: student.semester,
    },
  });

  // Add subjects with zero attendance if not present
  for (const s of subjectsForTerm) {
    if (!attendanceBySubject.has(s.id)) {
      attendanceStats.push({
        subjectId: s.id,
        subjectName: s.name,
        presentCount: 0,
        totalClasses: 0,
        percentage: 0,
      });
    }
  }

  attendanceStats.sort((a, b) => a.subjectName.localeCompare(b.subjectName));

  return (
    <div className="py-8 px-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Student Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome, <span className="font-medium">{student.name}</span> — Roll:{" "}
            <span className="font-mono">{student.roll}</span>
          </p>
        </div>

        <div className="text-right">
          <p className="text-sm text-muted-foreground">Branch</p>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{student.branch?.name ?? "—"}</Badge>
            <span className="text-sm text-muted-foreground">Semester {student.semester}</span>
          </div>
        </div>
      </header>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Attendance Card */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Attendance percentage by subject. Total classes count is computed from recorded attendance dates.
            </p>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead className="text-right">Present</TableHead>
                  <TableHead className="text-right">Total Classes</TableHead>
                  <TableHead className="text-right">Attendance</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {attendanceStats.map((s) => (
                  <TableRow key={s.subjectId}>
                    <TableCell>{s.subjectName}</TableCell>
                    <TableCell className="text-right">{s.presentCount}</TableCell>
                    <TableCell className="text-right">{s.totalClasses}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-3">
                        <span className="font-medium">{s.percentage}%</span>
                        <div className="w-24 h-2 bg-slate-100 rounded overflow-hidden">
                          <div
                            className="h-full bg-emerald-500"
                            style={{ width: `${s.percentage}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* CT Marks Card */}
        <Card>
          <CardHeader>
            <CardTitle>Class Test (CT) Marks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              CT marks grouped by subject and CT number.
            </p>

            {ctList.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-8">
                No CT marks available yet.
              </div>
            ) : (
              <div className="space-y-6">
                {Array.from(groupBy(ctList, (c) => c.subjectName)).map(([subjectName, items]) => (
                  <section key={subjectName} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{subjectName}</h3>
                      <span className="text-sm text-muted-foreground">
                        Avg: {average(items.map((i) => i.marks)).toFixed(1)}
                      </span>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>CT No.</TableHead>
                          <TableHead className="text-right">Marks</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((ct) => (
                          <TableRow key={`${ct.subjectId}-${ct.ctNumber}`}>
                            <TableCell>CT {ct.ctNumber}</TableCell>
                            <TableCell className="text-right">{ct.marks}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </section>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator />

      <footer className="text-sm text-muted-foreground">
        Data is read-only for students. Contact your teacher or admin for corrections.
      </footer>
    </div>
  );
}

/* ============================
   Small helpers (server-side)
   ============================ */

function groupBy<T, K extends string | number>(
  arr: T[],
  keyFn: (it: T) => K
): [K, T[]][] {
  const map = new Map<K, T[]>();
  for (const item of arr) {
    const k = keyFn(item);
    const list = map.get(k) ?? [];
    list.push(item);
    map.set(k, list);
  }
  return Array.from(map.entries());
}

function average(nums: number[]) {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}
