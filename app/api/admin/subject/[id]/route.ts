export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const subjectId = Number(id);

    if (!subjectId) {
      return NextResponse.json({ error: "Invalid subject ID" }, { status: 400 });
    }

    const { name, semester, branchId, teacherId } = await req.json();

    if (!name || !semester || !branchId || !teacherId) {
      return NextResponse.json(
        { error: "Name, Semester, Branch ID, and Teacher ID are required" },
        { status: 400 }
      );
    }

    const subject = await prisma.subject.update({
      where: { id: subjectId },
      data: {
        name,
        semester: Number(semester),
        branchId: Number(branchId),
        teachers: {
          set: [],
          connect: { id: Number(teacherId) },
        },
      },
    });

    return NextResponse.json({ success: true, subject });
  } catch (error) {
    console.error("Edit subject error:", error);
    return NextResponse.json(
      { error: "Failed to update subject" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const subjectId = Number(id);

    if (!subjectId) {
      return NextResponse.json({ error: "Invalid subject ID" }, { status: 400 });
    }

    await prisma.subject.delete({
      where: { id: subjectId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete subject error:", error);
    return NextResponse.json(
      { error: "Failed to delete subject" },
      { status: 500 }
    );
  }
}
