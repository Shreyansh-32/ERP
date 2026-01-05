export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await requireAdmin();

    const { name, semester, branchId, teacherId } = await req.json();

    if (!name || !semester || !branchId || !teacherId) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    await prisma.subject.create({
      data: {
        name,
        semester,
        branchId,
        teachers: {
          connect: { id: teacherId },
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
