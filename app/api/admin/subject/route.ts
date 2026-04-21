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

export async function GET(req: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const branchId = searchParams.get("branchId");
    const semester = searchParams.get("semester");

    const where: any = {};
    if (branchId) where.branchId = Number(branchId);
    if (semester) where.semester = Number(semester);

    const subjects = await prisma.subject.findMany({
      where,
      include: {
        teachers: {
          select: {
            id: true,
            name: true,
            employeeId: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ subjects });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
