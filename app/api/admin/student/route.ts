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
