"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  Legend,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer } from "@/components/charts/ChartContainer";
import { AlertTriangle, BarChart2, BookOpen, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";

/* ================= TYPES ================= */

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
  ctNumber: 1 | 2;
  marks: number;
};

type AssignmentStat = {
  subjectId: number;
  subjectName: string;
  assignment1: boolean;
  assignment2: boolean;
};

type QuizStat = {
  subjectId: number;
  subjectName: string;
  quiz1Marks: number | null;
  quiz2Marks: number | null;
  quiz1Present: boolean;
  quiz2Present: boolean;
};

type AttendanceTimelineEntry = {
  subjectId: number;
  subjectName: string;
  date: string; // yyyy-mm-dd
  present: boolean;
};

type Props = {
  student: {
    name: string;
    roll: string;
    branch: string;
    semester: number;
  };
  attendanceStats: AttendanceStat[];
  ctList: StudentCT[];
  ctChartData: { subject: string; CT1: number; CT2: number }[];
  overallAttendance: number;
  overallCTAverage: number;
  assignmentStats: AssignmentStat[];
  quizStats: QuizStat[];
  attendanceTimeline: AttendanceTimelineEntry[];
};

/* ================= COMPONENT ================= */

export default function StudentDashboardClient({
  student,
  attendanceStats,
  ctList,
  ctChartData,
  overallAttendance,
  overallCTAverage,
  assignmentStats,
  quizStats,
  attendanceTimeline,
}: Props) {
  const subjectsCount = attendanceStats.length;
  const totalPresent = attendanceStats.reduce((sum, s) => sum + s.presentCount, 0);
  const totalClasses = attendanceStats.reduce((sum, s) => sum + s.totalClasses, 0);

  const bestAttendance = attendanceStats.length
    ? [...attendanceStats].sort((a, b) => b.percentage - a.percentage)[0]
    : undefined;
  const lowestAttendance = attendanceStats.length
    ? [...attendanceStats].sort((a, b) => a.percentage - b.percentage)[0]
    : undefined;

  const assignmentChartData = assignmentStats.map((a) => ({
    subject: a.subjectName,
    A1: a.assignment1 ? 1 : 0,
    A2: a.assignment2 ? 1 : 0,
  }));

  const quizChartData = quizStats.map((q) => ({
    subject: q.subjectName,
    Quiz1: q.quiz1Marks ?? 0,
    Quiz2: q.quiz2Marks ?? 0,
  }));

  const [attendanceRange, setAttendanceRange] = useState<"7d" | "30d" | "365d" | "all">("all");

  const filteredAttendanceChartData = useMemo(() => {
    const base = new Map<number, { subject: string; present: number; total: number }>();
    for (const s of attendanceStats) {
      base.set(s.subjectId, { subject: s.subjectName, present: 0, total: 0 });
    }

    const cutoff = (() => {
      const now = new Date();
      if (attendanceRange === "7d") return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      if (attendanceRange === "30d") return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      if (attendanceRange === "365d") return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      return null;
    })();

    for (const entry of attendanceTimeline) {
      const entryDate = new Date(entry.date);
      if (cutoff && entryDate < cutoff) continue;
      const agg = base.get(entry.subjectId);
      if (!agg) continue;
      agg.total += 1;
      if (entry.present) agg.present += 1;
    }

    return Array.from(base.values()).map((v) => ({
      subject: v.subject,
      percentage: v.total > 0 ? Math.round((v.present / v.total) * 100) : 0,
    }));
  }, [attendanceRange, attendanceStats, attendanceTimeline]);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <div className="pointer-events-none absolute inset-x-0 -top-16 -z-10 h-56 bg-gradient-to-r from-sky-500/15 via-indigo-500/10 to-emerald-500/10 blur-3xl" />
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        {/* HEADER */}
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Student</p>
            <h1 className="text-3xl font-semibold tracking-tight">Student Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              {student.name} • Roll {student.roll}
            </p>
          </div>

          <div className="flex flex-col items-end gap-1 text-right">
            <Badge variant="outline">{student.branch}</Badge>
            <p className="text-sm text-muted-foreground">Semester {student.semester}</p>
          </div>
        </header>

        {/* STATS */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Overall Attendance",
              value: `${overallAttendance}%`,
              icon: <TrendingUp className="h-4 w-4 text-emerald-600" />,
              hint: `${totalPresent} of ${totalClasses || 0} classes attended`,
            },
            {
              label: "CT Average",
              value: `${overallCTAverage.toFixed(1)} / 20`,
              icon: <BarChart2 className="h-4 w-4 text-indigo-600" />,
              hint: `${subjectsCount} subjects`,
            },
            {
              label: "Best Attendance",
              value: bestAttendance ? `${bestAttendance.subjectName}` : "—",
              icon: <BookOpen className="h-4 w-4 text-sky-600" />,
              hint: bestAttendance ? `${bestAttendance.percentage}%` : "No data",
            },
            {
              label: "Watchlist",
              value: lowestAttendance ? `${lowestAttendance.subjectName}` : "—",
              icon: <AlertTriangle className="h-4 w-4 text-amber-600" />,
              hint: lowestAttendance ? `${lowestAttendance.percentage}%` : "No data",
            },
          ].map((stat) => (
            <Card key={stat.label} className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                {stat.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.hint}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CHARTS */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-sm">
            <CardHeader className="flex items-center justify-between gap-3">
              <CardTitle>Attendance by Subject</CardTitle>
              <Tabs value={attendanceRange} onValueChange={(v) => setAttendanceRange(v as typeof attendanceRange)}>
                <TabsList>
                  <TabsTrigger value="7d">7d</TabsTrigger>
                  <TabsTrigger value="30d">30d</TabsTrigger>
                  <TabsTrigger value="365d">365d</TabsTrigger>
                  <TabsTrigger value="all">All</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <ChartContainer>
                <BarChart data={filteredAttendanceChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="subject"
                    interval={0}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v) => (v.length > 16 ? `${v.slice(0, 16)}…` : v)}
                  />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="percentage" fill="#22c55e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>CT Performance (CT1 vs CT2)</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer>
                <BarChart data={ctChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" />
                  <YAxis domain={[0, 20]} />
                  <Tooltip />
                  <Bar dataKey="CT1" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="CT2" fill="#22d3ee" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="shadow-sm lg:col-span-2">
            <CardHeader>
              <CardTitle>Attendance Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead className="text-right">Present</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">%</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceStats.map((s) => (
                    <TableRow key={s.subjectId}>
                      <TableCell>{s.subjectName}</TableCell>
                      <TableCell className="text-right">{s.presentCount}</TableCell>
                      <TableCell className="text-right">{s.totalClasses}</TableCell>
                      <TableCell className="text-right font-medium">{s.percentage}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Assignment Submission</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer>
                <BarChart data={assignmentChartData} margin={{ bottom: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="subject"
                    interval={0}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v) => (v.length > 16 ? `${v.slice(0, 16)}…` : v)}
                  />
                  <YAxis domain={[0, 1]} allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="A1" name="Assignment 1" fill="#22c55e" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="A2" name="Assignment 2" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>CT Marks</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>CT</TableHead>
                    <TableHead className="text-right">Marks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ctList.map((ct) => (
                    <TableRow key={`${ct.subjectId}-${ct.ctNumber}`}>
                      <TableCell>{ct.subjectName}</TableCell>
                      <TableCell>CT {ct.ctNumber}</TableCell>
                      <TableCell className="text-right">{ct.marks}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Attendance Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {attendanceStats.map((s) => (
                <div key={s.subjectId} className="space-y-1">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{s.subjectName}</span>
                    <span className="text-foreground font-medium">{s.percentage}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${Math.min(100, s.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Quiz Marks (Area)</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer>
                <AreaChart data={quizChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" interval={0} tick={{ fontSize: 12 }} tickFormatter={(v) => (v.length > 16 ? `${v.slice(0, 16)}…` : v)} />
                  <YAxis domain={[0, 20]} />
                  <Tooltip />
                  <Area type="monotone" dataKey="Quiz1" stroke="#6366f1" fill="#6366f1" fillOpacity={0.35} />
                  <Area type="monotone" dataKey="Quiz2" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.3} />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Assignments & Quizzes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>A1</TableHead>
                    <TableHead>A2</TableHead>
                    <TableHead>Quiz 1</TableHead>
                    <TableHead>Quiz 2</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quizStats.map((q) => {
                    const assignments = assignmentStats.find((a) => a.subjectId === q.subjectId);
                    const badgeClass = (ok: boolean) => (ok ? "bg-emerald-500/10 text-emerald-700" : "bg-amber-500/10 text-amber-700");
                    return (
                      <TableRow key={q.subjectId}>
                        <TableCell>{q.subjectName}</TableCell>
                        <TableCell>
                          <Badge className={badgeClass(!!assignments?.assignment1)} variant="outline">
                            {assignments?.assignment1 ? "Submitted" : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={badgeClass(!!assignments?.assignment2)} variant="outline">
                            {assignments?.assignment2 ? "Submitted" : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span>{q.quiz1Marks ?? "—"}</span>
                            <Badge variant="outline" className={badgeClass(q.quiz1Present)}>
                              {q.quiz1Present ? "Present" : "Absent"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span>{q.quiz2Marks ?? "—"}</span>
                            <Badge variant="outline" className={badgeClass(q.quiz2Present)}>
                              {q.quiz2Present ? "Present" : "Absent"}
                            </Badge>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <Separator />

        <footer className="text-sm text-muted-foreground">
          Data is read-only. Contact faculty for corrections.
        </footer>
      </div>
    </div>
  );
}
