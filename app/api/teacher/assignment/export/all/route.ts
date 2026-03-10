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

  const records = await prisma.assignmentSubmission.findMany({
    where: { subjectId, assignmentNumber: { in: [1, 2] } },
    select: { studentId: true, assignmentNumber: true, submitted: true },
  });

  const a1 = new Map<number, boolean>();
  const a2 = new Map<number, boolean>();

  for (const r of records) {
    if (r.assignmentNumber === 1) a1.set(r.studentId, r.submitted);
    if (r.assignmentNumber === 2) a2.set(r.studentId, r.submitted);
  }

  let csv = "Roll,Name,Assignment1,Assignment2\n";

  for (const student of students) {
    const s1 = a1.get(student.id);
    const s2 = a2.get(student.id);
    csv += `${student.roll},${student.name},${s1 ? "Yes" : ""},${s2 ? "Yes" : ""}\n`;
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename=assignments_subject_${subjectId}.csv`,
    },
  });
}
