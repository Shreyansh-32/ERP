export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const subjectId = Number(searchParams.get("subjectId"));
  const quizNumber = Number(searchParams.get("quizNumber"));

  if (!subjectId || !quizNumber) {
    return NextResponse.json({ records: [] });
  }

  const records = await prisma.quiz.findMany({
    where: { subjectId, quizNumber },
    select: { studentId: true, marks: true, present: true },
  });

  return NextResponse.json({ records });
}
