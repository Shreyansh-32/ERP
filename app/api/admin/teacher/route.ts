import { prisma } from "@/lib/prisma";

import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { requireAdmin } from "@/lib/adminGuard";

export async function POST(req: Request) {
  try {
    await requireAdmin();

    const { employeeId, name, password, branchId } = await req.json();

    if (!employeeId || !name || !password || !branchId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);

    await prisma.teacher.create({
      data: {
        employeeId,
        name,
        password: hashed,
        branchId,
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

    const where = branchId ? { branchId: Number(branchId) } : {};

    const teachers = await prisma.teacher.findMany({
      where,
      select: {
        id: true,
        employeeId: true,
        name: true,
        branchId: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ teachers });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
