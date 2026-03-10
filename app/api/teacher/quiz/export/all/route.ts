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

  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    select: { branchId: true, semester: true },
  });

  if (!subject) {
    return NextResponse.json({ error: "Subject not found" }, { status: 404 });
  }

  const students = await prisma.student.findMany({
    where: {
      branchId: subject.branchId,
      semester: subject.semester,
    },
    orderBy: { roll: "asc" },
  });

  const records = await prisma.quiz.findMany({
    where: { subjectId, quizNumber: { in: [1, 2] } },
    select: { studentId: true, quizNumber: true, marks: true, present: true },
  });

  const q1 = new Map<number, { marks: number | null; present: boolean }>();
  const q2 = new Map<number, { marks: number | null; present: boolean }>();

  for (const r of records) {
    const entry = { marks: r.marks ?? null, present: r.present };
    if (r.quizNumber === 1) q1.set(r.studentId, entry);
    if (r.quizNumber === 2) q2.set(r.studentId, entry);
  }

  let csv = "Roll,Name,Quiz1 Marks,Quiz1 Present,Quiz2 Marks,Quiz2 Present\n";

  for (const student of students) {
    const a = q1.get(student.id);
    const b = q2.get(student.id);
    csv += `${student.roll},${student.name},${a?.marks ?? ""},${a?.present ? "Yes" : ""},${b?.marks ?? ""},${b?.present ? "Yes" : ""}\n`;
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename=quiz_subject_${subjectId}.csv`,
    },
  });
}
