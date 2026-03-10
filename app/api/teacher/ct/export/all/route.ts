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

  const records = await prisma.cT.findMany({
    where: { subjectId, ctNumber: { in: [1, 2] } },
    select: {
      studentId: true,
      ctNumber: true,
      marks: true,
    },
  });

  const ct1 = new Map<number, number>();
  const ct2 = new Map<number, number>();

  for (const r of records) {
    if (r.ctNumber === 1) ct1.set(r.studentId, r.marks);
    if (r.ctNumber === 2) ct2.set(r.studentId, r.marks);
  }

  let csv = "Roll,Name,CT1,CT2\n";

  for (const student of students) {
    const m1 = ct1.get(student.id);
    const m2 = ct2.get(student.id);
    csv += `${student.roll},${student.name},${m1 === undefined ? "" : m1},${m2 === undefined ? "" : m2}\n`;
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename=ct_all_subject_${subjectId}.csv`,
    },
  });
}
