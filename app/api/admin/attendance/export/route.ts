export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const branchId = Number(searchParams.get("branchId"));
    const semester = Number(searchParams.get("semester"));

    if (!branchId || !semester) {
      return NextResponse.json(
        { error: "Branch ID and Semester required" },
        { status: 400 }
      );
    }

    /* ================================================ */
    /*           FETCH SUBJECTS FOR BRANCH/SEMESTER    */
    /* ================================================ */

    const subjects = await prisma.subject.findMany({
      where: {
        branchId,
        semester,
      },
      orderBy: { name: "asc" },
    });

    if (subjects.length === 0) {
      return NextResponse.json(
        { error: "No subjects found for this branch and semester" },
        { status: 404 }
      );
    }

    const subjectIds = subjects.map((s) => s.id);

    /* ================================================ */
    /*           FETCH ALL STUDENTS FOR BRANCH/SEMESTER*/
    /* ================================================ */

    const students = await prisma.student.findMany({
      where: {
        branchId,
        semester,
      },
      orderBy: { roll: "asc" },
    });

    /* ================================================ */
    /*     FETCH ALL ATTENDANCE RECORDS FOR SUBJECTS   */
    /* ================================================ */

    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        subjectId: { in: subjectIds },
      },
      orderBy: { date: "asc" },
    });

    /* ================================================ */
    /*    BUILD SUBJECT-WISE ATTENDANCE DATA           */
    /* ================================================ */

    // Map: subjectId -> subjectName
    const subjectNameMap = new Map<number, string>();
    subjects.forEach((s) => subjectNameMap.set(s.id, s.name));

    // Map: (subjectId, studentRoll) -> Set<date> (for tracking attended dates per subject)
    const subjectStudentAttendance = new Map<
      string,
      Map<string, Set<string>>
    >();

    for (const subject of subjects) {
      const subjectKey = subject.id.toString();
      subjectStudentAttendance.set(subjectKey, new Map());
    }

    for (const record of attendanceRecords) {
      const subjectKey = record.subjectId.toString();
      if (!subjectStudentAttendance.has(subjectKey)) {
        subjectStudentAttendance.set(subjectKey, new Map());
      }

      const studentMap = subjectStudentAttendance.get(subjectKey)!;
      if (!studentMap.has(record.studentRoll)) {
        studentMap.set(record.studentRoll, new Set());
      }

      const dateStr = record.date.toISOString().split("T")[0];
      studentMap.get(record.studentRoll)!.add(dateStr);
    }

    /* ================================================ */
    /*    GET TOTAL CLASSES PER SUBJECT                */
    /* ================================================ */

    const subjectClassCountMap = new Map<number, number>();

    for (const subject of subjects) {
      const totalDates = new Set(
        attendanceRecords
          .filter((a) => a.subjectId === subject.id)
          .map((a) => a.date.toISOString().split("T")[0])
      );
      subjectClassCountMap.set(subject.id, totalDates.size);
    }

    /* ================================================ */
    /*           BUILD CSV CONTENT                     */
    /* ================================================ */

    let csv = "Overall Attendance Summary Report\n";
    csv += `Branch: Semester ${semester}\n`;
    csv += `Date Generated: ${new Date().toISOString().split("T")[0]}\n`;
    csv += `Total Subjects: ${subjects.length}\n\n`;

    // Subject-wise class count summary
    csv += "Subject-wise Class Count:\n";
    for (const subject of subjects) {
      const classCount = subjectClassCountMap.get(subject.id) || 0;
      csv += `${subject.name},${classCount}\n`;
    }

    csv +=
      "\n==================== OVERALL ATTENDANCE ====================\n";
    csv += "Roll,Name";

    // Add columns for each subject (showing attended/total)
    for (const subject of subjects) {
      csv += `,${subject.name}`;
    }

    csv += ",Total Attended,Total Classes,Overall Attendance %\n";

    // Add student records
    for (const student of students) {
      let grandTotalAttended = 0;
      let grandTotalClasses = 0;

      csv += `${student.roll},${student.name}`;

      const attendanceDetails: string[] = [];

      for (const subject of subjects) {
        const subjectKey = subject.id.toString();
        const studentMap = subjectStudentAttendance.get(subjectKey) || new Map();
        const attended = studentMap.get(student.roll)?.size || 0;
        const totalClasses = subjectClassCountMap.get(subject.id) || 0;

        grandTotalAttended += attended;
        grandTotalClasses += totalClasses;

        attendanceDetails.push(`${attended}/${totalClasses}`);
      }

      // Add subject-wise attendance
      for (const detail of attendanceDetails) {
        csv += `,${detail}`;
      }

      // Add totals and overall percentage
      const overallPercentage =
        grandTotalClasses === 0
          ? "0"
          : ((grandTotalAttended / grandTotalClasses) * 100).toFixed(2);

      csv += `,${grandTotalAttended},${grandTotalClasses},${overallPercentage}\n`;
    }

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=attendance_export_branch_${branchId}_sem_${semester}.csv`,
      },
    });
  } catch (error) {
    console.error("Export attendance error:", error);
    return NextResponse.json(
      { error: "Failed to export attendance" },
      { status: 500 }
    );
  }
}
