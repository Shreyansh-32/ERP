export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const branchId = Number(searchParams.get("branchId"));

    if (!branchId) {
      return NextResponse.json({ teachers: [] });
    }

    const teachers = await prisma.teacher.findMany({
      where: { branchId },
      select: {
        id: true,
        name: true,
        employeeId: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ teachers });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
