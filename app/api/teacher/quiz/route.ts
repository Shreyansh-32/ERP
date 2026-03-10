import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { subjectId, quizNumber, records } = await req.json();

  if (!subjectId || !quizNumber || !Array.isArray(records)) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  for (const r of records) {
    await prisma.quiz.upsert({
      where: {
        studentId_subjectId_quizNumber: {
          studentId: r.studentId,
          subjectId,
          quizNumber,
        },
      },
      update: {
        marks: r.marks === null || r.marks === undefined || Number.isNaN(Number(r.marks))
          ? null
          : Number(r.marks),
        present: Boolean(r.present),
      },
      create: {
        studentId: r.studentId,
        subjectId,
        quizNumber,
        marks: r.marks === null || r.marks === undefined || Number.isNaN(Number(r.marks))
          ? null
          : Number(r.marks),
        present: Boolean(r.present),
        semester: r.semester,
        branchId: r.branchId,
      },
    });
  }

  return NextResponse.json({ success: true });
}
