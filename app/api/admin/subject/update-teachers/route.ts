export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await requireAdmin();

    const { subjectId, teacherIds } = await req.json();

    if (!subjectId || !Array.isArray(teacherIds)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await prisma.subject.update({
      where: { id: subjectId },
      data: {
        teachers: {
          set: teacherIds.map((id: number) => ({ id })),
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
