import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { subjectId, date, presentRolls } = await req.json();
  if (!subjectId || !date) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

 // 1. Delete old attendance for that subject+date
await prisma.attendance.deleteMany({
  where: {
    subjectId,
    date: new Date(date)
  },
});

// 2. Insert fresh attendance
await prisma.attendance.createMany({
  data: presentRolls.map((roll: string) => ({
    studentRoll: roll,
    subjectId,
    date: new Date(date),
  })),
});

  return NextResponse.json({ success: true });
}
