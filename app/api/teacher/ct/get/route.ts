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
  const ctNumber = Number(searchParams.get("ctNumber"));

  if (!subjectId || !ctNumber) {
    return NextResponse.json({ marks: [] });
  }

  const marks = await prisma.cT.findMany({
    where: {
      subjectId,
      ctNumber,
    },
    select: {
      studentId: true,
      marks: true,
    },
  });

  return NextResponse.json({ marks });
}
