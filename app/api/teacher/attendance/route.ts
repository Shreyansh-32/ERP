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

  if (!subjectId || !date || !Array.isArray(presentRolls)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const attendanceDate = new Date(date);
  attendanceDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 🚫 FUTURE DATE PROTECTION
  if (attendanceDate > today) {
    return NextResponse.json(
      { error: "Cannot mark attendance for future dates" },
      { status: 400 }
    );
  }

  // 🔁 Replace attendance for that date
  await prisma.attendance.deleteMany({
    where: {
      subjectId,
      date: attendanceDate,
    },
  });

  await prisma.attendance.createMany({
    data: presentRolls.map((roll: string) => ({
      studentRoll: roll,
      subjectId,
      date: attendanceDate,
    })),
  });

  return NextResponse.json({ success: true });
}
