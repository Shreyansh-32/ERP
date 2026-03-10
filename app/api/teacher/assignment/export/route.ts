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
  const assignmentNumber = Number(searchParams.get("assignmentNumber"));

  if (!subjectId || !assignmentNumber) {
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

  const records = await prisma.assignmentSubmission.findMany({
    where: { subjectId, assignmentNumber },
    select: { studentId: true, submitted: true },
  });

  const submittedMap = new Map<number, boolean>();
  for (const r of records) {
    submittedMap.set(r.studentId, r.submitted);
  }

  let csv = "Roll,Name,Submitted\n";

  for (const student of students) {
    const submitted = submittedMap.get(student.id);
    csv += `${student.roll},${student.name},${submitted ? "Yes" : ""}\n`;
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename=assignment_${assignmentNumber}.csv`,
    },
  });
}
