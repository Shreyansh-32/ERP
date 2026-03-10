import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { subjectId, assignmentNumber, submissions } = await req.json();

  if (!subjectId || !assignmentNumber || !Array.isArray(submissions)) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  for (const s of submissions) {
    await prisma.assignmentSubmission.upsert({
      where: {
        studentId_subjectId_assignmentNumber: {
          studentId: s.studentId,
          subjectId,
          assignmentNumber,
        },
      },
      update: { submitted: Boolean(s.submitted) },
      create: {
        studentId: s.studentId,
        subjectId,
        submitted: Boolean(s.submitted),
        assignmentNumber,
        semester: s.semester,
        branchId: s.branchId,
      },
    });
  }

  return NextResponse.json({ success: true });
}
