import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { authOptions } from "@/lib/authOptions";

import StudentDashboardClient from "./StudentDashboardClient";

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

/* ================= HELPERS ================= */

const percent = (num: number, den: number) =>
  den === 0 ? 0 : Math.round((num / den) * 100);

const average = (nums: number[]) =>
  nums.length === 0 ? 0 : nums.reduce((a, b) => a + b, 0) / nums.length;

/* ================= PAGE ================= */

export default async function StudentDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect("/login");

  if (session.user.role !== "student") {
    if (session.user.role === "teacher") redirect("/teacher/dashboard");
    if (session.user.role === "admin") redirect("/admin/dashboard");
    notFound();
  }

  const roll = session.user.identifier;
  if (!roll) notFound();

  const student = await prisma.student.findUnique({
    where: { roll },
    include: {
      branch: true,
      attendance: { include: { subject: true } },
      ctMarks: { include: { subject: true } },
    },
  });

  if (!student) notFound();

  /* ================= ATTENDANCE ================= */

  const attendanceMap = new Map<number, AttendanceStat>();

  for (const att of student.attendance) {
    const sid = att.subjectId;
    const name = att.subject?.name ?? "Unknown";

    const stat =
      attendanceMap.get(sid) ??
      {
        subjectId: sid,
        subjectName: name,
        presentCount: 0,
        totalClasses: 0,
        percentage: 0,
      };

    stat.presentCount += 1;
    attendanceMap.set(sid, stat);
  }

  for (const [sid, stat] of attendanceMap) {
    const distinctDates = await prisma.attendance.findMany({
      where: { subjectId: sid },
      distinct: ["date"],
      select: { date: true },
    });

    stat.totalClasses = distinctDates.length;
    stat.percentage = percent(stat.presentCount, stat.totalClasses);
  }

  const subjectsForTerm = await prisma.subject.findMany({
    where: {
      branchId: student.branchId,
      semester: student.semester,
    },
  });

  for (const s of subjectsForTerm) {
    if (!attendanceMap.has(s.id)) {
      attendanceMap.set(s.id, {
        subjectId: s.id,
        subjectName: s.name,
        presentCount: 0,
        totalClasses: 0,
        percentage: 0,
      });
    }
  }

  const attendanceStats = Array.from(attendanceMap.values()).sort((a, b) =>
    a.subjectName.localeCompare(b.subjectName)
  );

  /* ✅ CORRECT OVERALL ATTENDANCE (WEIGHTED) */
  const totalPresent = attendanceStats.reduce(
    (sum, s) => sum + s.presentCount,
    0
  );

  const totalClasses = attendanceStats.reduce(
    (sum, s) => sum + s.totalClasses,
    0
  );

  const overallAttendance =
    totalClasses === 0
      ? 0
      : Math.round((totalPresent / totalClasses) * 100);

  /* ================= CT (ONLY CT1 & CT2) ================= */

  const ctList: StudentCT[] = student.ctMarks
    .filter((c) => c.ctNumber === 1 || c.ctNumber === 2)
    .map((c) => ({
      subjectId: c.subjectId,
      subjectName: c.subject?.name ?? "Unknown",
      ctNumber: c.ctNumber as 1 | 2,
      marks: c.marks,
    }))
    .sort((a, b) =>
      a.subjectName === b.subjectName
        ? a.ctNumber - b.ctNumber
        : a.subjectName.localeCompare(b.subjectName)
    );

  const overallCTAverage = average(ctList.map((c) => c.marks));

  /* ================= CHART DATA ================= */

  const ctChartMap = new Map<
    string,
    { subject: string; CT1: number; CT2: number }
  >();

  for (const ct of ctList) {
    if (!ctChartMap.has(ct.subjectName)) {
      ctChartMap.set(ct.subjectName, {
        subject: ct.subjectName,
        CT1: 0,
        CT2: 0,
      });
    }

    if (ct.ctNumber === 1) ctChartMap.get(ct.subjectName)!.CT1 = ct.marks;
    if (ct.ctNumber === 2) ctChartMap.get(ct.subjectName)!.CT2 = ct.marks;
  }

  const ctChartData = Array.from(ctChartMap.values());

  /* ================= ASSIGNMENTS ================= */

  const assignments = await prisma.assignmentSubmission.findMany({
    where: { studentId: student.id },
    include: { subject: true },
  });

  const assignmentMap = new Map<number, AssignmentStat>();

  for (const s of subjectsForTerm) {
    assignmentMap.set(s.id, {
      subjectId: s.id,
      subjectName: s.name,
      assignment1: false,
      assignment2: false,
    });
  }

  for (const a of assignments) {
    const stat = assignmentMap.get(a.subjectId);
    if (!stat) continue;
    if (a.assignmentNumber === 1) stat.assignment1 = a.submitted;
    if (a.assignmentNumber === 2) stat.assignment2 = a.submitted;
  }

  const assignmentStats = Array.from(assignmentMap.values()).sort((a, b) =>
    a.subjectName.localeCompare(b.subjectName)
  );

  /* ================= QUIZ ================= */

  const quizRecords = await prisma.quiz.findMany({
    where: { studentId: student.id },
    include: { subject: true },
  });

  const quizMap = new Map<number, QuizStat>();

  for (const s of subjectsForTerm) {
    quizMap.set(s.id, {
      subjectId: s.id,
      subjectName: s.name,
      quiz1Marks: null,
      quiz2Marks: null,
      quiz1Present: false,
      quiz2Present: false,
    });
  }

  for (const q of quizRecords) {
    const stat = quizMap.get(q.subjectId);
    if (!stat) continue;
    if (q.quizNumber === 1) {
      stat.quiz1Marks = q.marks ?? null;
      stat.quiz1Present = q.present;
    }
    if (q.quizNumber === 2) {
      stat.quiz2Marks = q.marks ?? null;
      stat.quiz2Present = q.present;
    }
  }

  const quizStats = Array.from(quizMap.values()).sort((a, b) =>
    a.subjectName.localeCompare(b.subjectName)
  );

  /* ================= ATTENDANCE TIMELINE ================= */

  const subjectIdList = subjectsForTerm.map((s) => s.id);

  const classDates = await prisma.attendance.findMany({
    where: { subjectId: { in: subjectIdList } },
    distinct: ["subjectId", "date"],
    select: { subjectId: true, date: true },
  });

  const classDateMap = new Map<number, Set<string>>();
  for (const cd of classDates) {
    const d = cd.date.toISOString().split("T")[0];
    if (!classDateMap.has(cd.subjectId)) classDateMap.set(cd.subjectId, new Set());
    classDateMap.get(cd.subjectId)!.add(d);
  }

  const presentDateMap = new Map<number, Set<string>>();
  for (const att of student.attendance) {
    const d = att.date.toISOString().split("T")[0];
    if (!presentDateMap.has(att.subjectId)) presentDateMap.set(att.subjectId, new Set());
    presentDateMap.get(att.subjectId)!.add(d);
  }

  const subjectNameMap = new Map<number, string>(subjectsForTerm.map((s) => [s.id, s.name]));

  const attendanceTimeline: AttendanceTimelineEntry[] = [];
  for (const [sid, dates] of classDateMap) {
    const presentDates = presentDateMap.get(sid) ?? new Set<string>();
    for (const d of dates) {
      attendanceTimeline.push({
        subjectId: sid,
        subjectName: subjectNameMap.get(sid) ?? "Unknown",
        date: d,
        present: presentDates.has(d),
      });
    }
  }

  return (
    <StudentDashboardClient
      student={{
        name: student.name,
        roll: student.roll,
        branch: student.branch?.name ?? "",
        semester: student.semester,
      }}
      attendanceStats={attendanceStats}
      ctList={ctList}
      ctChartData={ctChartData}
      overallAttendance={overallAttendance}
      overallCTAverage={overallCTAverage}
      assignmentStats={assignmentStats}
      quizStats={quizStats}
      attendanceTimeline={attendanceTimeline}
    />
  );
}
