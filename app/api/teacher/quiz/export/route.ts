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
  const quizNumber = Number(searchParams.get("quizNumber"));

  if (!subjectId || !quizNumber) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
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
    where: { subjectId, quizNumber },
    select: { studentId: true, marks: true, present: true },
  });

  const quizMap = new Map<number, { marks: number | null; present: boolean }>();
  for (const r of records) {
    quizMap.set(r.studentId, { marks: r.marks ?? null, present: r.present });
  }

  let csv = "Roll,Name,Marks,Present\n";

  for (const student of students) {
    const rec = quizMap.get(student.id);
    const marks = rec?.marks ?? "";
    const present = rec?.present ? "Yes" : "";
    csv += `${student.roll},${student.name},${marks},${present}\n`;
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename=quiz_${quizNumber}.csv`,
    },
  });
}
