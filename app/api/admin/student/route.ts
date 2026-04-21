import { prisma } from "@/lib/prisma";

import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { requireAdmin } from "@/lib/adminGuard";

export async function POST(req: Request) {
  try {
    await requireAdmin();

    const { roll, name, password, semester, branchId } = await req.json();

    if (!roll || !name || !password || !semester || !branchId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);

    await prisma.student.create({
      data: {
        roll,
        name,
        password: hashed,
        semester,
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
    const semester = searchParams.get("semester");

    const where: any = {};
    if (branchId) where.branchId = Number(branchId);
    if (semester) where.semester = Number(semester);

    const students = await prisma.student.findMany({
      where,
      select: {
        id: true,
        roll: true,
        name: true,
        semester: true,
        branchId: true,
      },
      orderBy: { roll: "asc" },
    });

    return NextResponse.json({ students });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
