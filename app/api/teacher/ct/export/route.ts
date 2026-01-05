export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const subjectId = Number(searchParams.get("subjectId"));
  const ctNumber = Number(searchParams.get("ctNumber"));

  if (!subjectId || !ctNumber) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  const records = await prisma.cT.findMany({
    where: { subjectId, ctNumber },
    include: { student: true },
    orderBy: { studentId: "asc" },
  });

  let csv = "Roll,Name,CT Marks\n";

  for (const r of records) {
    csv += `${r.student.roll},${r.student.name},${r.marks}\n`;
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename=ct_${ctNumber}.csv`,
    },
  });
}
