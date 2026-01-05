"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
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
import { ChartContainer } from "@/components/charts/ChartContainer";

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

type Props = {
  student: {
    name: string;
    roll: string;
    branch: string;
    semester: number;
  };
  attendanceStats: AttendanceStat[];
  ctList: StudentCT[];
  attendanceChartData: { subject: string; percentage: number }[];
  ctChartData: { subject: string; CT1: number; CT2: number }[];
  overallAttendance: number;
  overallCTAverage: number;
};

/* ================= COMPONENT ================= */

export default function StudentDashboardClient({
  student,
  attendanceStats,
  ctList,
  attendanceChartData,
  ctChartData,
  overallAttendance,
  overallCTAverage,
}: Props) {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-10">
      {/* HEADER */}
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold">Student Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {student.name} • Roll {student.roll}
          </p>
        </div>

        <div className="text-right">
          <Badge variant="outline">{student.branch}</Badge>
          <p className="text-sm text-muted-foreground mt-1">
            Semester {student.semester}
          </p>
        </div>
      </header>

      {/* OVERALL */}
      <section className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Overall Attendance</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-5xl font-bold text-emerald-600">
              {overallAttendance}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Overall CT Average</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-5xl font-bold text-indigo-600">
              {overallCTAverage.toFixed(1)} / 20
            </div>
          </CardContent>
        </Card>
      </section>

      {/* CHARTS */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance by Subject</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer>
            <BarChart data={attendanceChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subject" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="percentage" fill="#22c55e" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
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
              <Bar dataKey="CT1" fill="#6366f1" />
              <Bar dataKey="CT2" fill="#22d3ee" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Separator />

      {/* TABLES */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Attendance Details</CardTitle>
          </CardHeader>
          <CardContent>
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
                    <TableCell className="text-right">
                      {s.presentCount}
                    </TableCell>
                    <TableCell className="text-right">
                      {s.totalClasses}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {s.percentage}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
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
      </div>

      <footer className="text-sm text-muted-foreground">
        Data is read-only. Contact faculty for corrections.
      </footer>
    </div>
  );
}
