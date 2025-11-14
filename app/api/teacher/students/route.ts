import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const branchId = Number(searchParams.get("branchId"));
  const semester = Number(searchParams.get("semester"));

  if (!branchId || !semester) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  const students = await prisma.student.findMany({
    where: { branchId, semester },
    orderBy: { roll: "asc" }
  });

  return NextResponse.json(students);
}
