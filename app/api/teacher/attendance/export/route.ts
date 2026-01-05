export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const subjectId = Number(searchParams.get("subjectId"));

  if (!subjectId) {
    return NextResponse.json({ error: "Subject ID required" }, { status: 400 });
  }

  /* ---------------------------------------------------- */
  /*                     FETCH DATA                       */
  /* ---------------------------------------------------- */

  const students = await prisma.student.findMany({
    where: {
      attendance: {
        some: { subjectId },
      },
    },
    orderBy: { roll: "asc" },
  });

  const attendanceRecords = await prisma.attendance.findMany({
    where: { subjectId },
    orderBy: { date: "asc" },
  });

  /* ---------------------------------------------------- */
  /*                UNIQUE SORTED DATES                   */
  /* ---------------------------------------------------- */

  const dates = Array.from(
    new Set(
      attendanceRecords.map((a) =>
        a.date.toISOString().split("T")[0]
      )
    )
  ).sort();

  /* ---------------------------------------------------- */
  /*               MAP: studentRoll → Set(date)           */
  /* ---------------------------------------------------- */

  const presentMap = new Map<string, Set<string>>();

  for (const record of attendanceRecords) {
    const date = record.date.toISOString().split("T")[0];

    if (!presentMap.has(record.studentRoll)) {
      presentMap.set(record.studentRoll, new Set());
    }

    presentMap.get(record.studentRoll)!.add(date);
  }

  /* ---------------------------------------------------- */
  /*                     BUILD CSV                        */
  /* ---------------------------------------------------- */

  let csv =
    "Roll,Name," +
    dates.join(",") +
    ",Total Classes,Attendance %\n";

  for (const student of students) {
    let presentCount = 0;

    const row = dates.map((date) => {
      const present = presentMap
        .get(student.roll)
        ?.has(date);

      if (present) presentCount++;
      return present ? "1" : "0";
    });

    const totalClasses = dates.length;
    const percentage =
      totalClasses === 0
        ? "0"
        : ((presentCount / totalClasses) * 100).toFixed(2);

    csv +=
      `${student.roll},${student.name},` +
      row.join(",") +
      `,${totalClasses},${percentage}\n`;
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename=attendance_subject_${subjectId}.csv`,
    },
  });
}
