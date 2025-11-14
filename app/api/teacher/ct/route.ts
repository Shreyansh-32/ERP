import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { subjectId, ctNumber, marks } = await req.json();

  if (!subjectId || !ctNumber || !marks) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  for (const m of marks) {
    await prisma.cT.upsert({
      where: {
        studentId_subjectId_ctNumber: {
          studentId: m.studentId,
          subjectId,
          ctNumber,
        },
      },
      update: { marks: m.marks },
      create: {
        studentId: m.studentId,
        subjectId,
        marks: m.marks,
        ctNumber,
        semester: m.semester,
        branchId: m.branchId,
      },
    });
  }

  return NextResponse.json({ success: true });
}
