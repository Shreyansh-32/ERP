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
  const date = searchParams.get("date");

  if (!subjectId || !date) {
    return NextResponse.json({ exists: false });
  }

  const attendanceDate = new Date(date);
  attendanceDate.setHours(0, 0, 0, 0);

  const records = await prisma.attendance.findMany({
    where: {
      subjectId,
      date: attendanceDate,
    },
    select: {
      studentRoll: true,
    },
  });

  return NextResponse.json({
    exists: records.length > 0,
    presentRolls: records.map((r) => r.studentRoll),
  });
}
