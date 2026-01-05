export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";
import { NextResponse } from "next/server";

/* ------------------------------------------------ */
/*               GET ALL BRANCHES                   */
/* ------------------------------------------------ */
export async function GET() {
  try {
    await requireAdmin();

    const branches = await prisma.branch.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ branches });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

/* ------------------------------------------------ */
/*               CREATE NEW BRANCH                  */
/* ------------------------------------------------ */
export async function POST(req: Request) {
  try {
    await requireAdmin();

    const { name } = await req.json();

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Branch name is required" },
        { status: 400 }
      );
    }

    const branch = await prisma.branch.create({
      data: { name },
    });

    return NextResponse.json({ branch });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
