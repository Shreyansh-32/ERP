import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const teacher = await prisma.teacher.findUnique({
    where: { employeeId: session.user.identifier },
    include: { subjects: true },
  });

  return NextResponse.json(teacher?.subjects || []);
}
