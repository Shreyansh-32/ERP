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
  const assignmentNumber = Number(searchParams.get("assignmentNumber"));

  if (!subjectId || !assignmentNumber) {
    return NextResponse.json({ submissions: [] });
  }

  const submissions = await prisma.assignmentSubmission.findMany({
    where: { subjectId, assignmentNumber },
    select: { studentId: true, submitted: true },
  });

  return NextResponse.json({ submissions });
}
