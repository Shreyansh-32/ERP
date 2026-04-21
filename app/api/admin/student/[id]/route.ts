import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { requireAdmin } from "@/lib/adminGuard";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const studentId = Number(id);

    if (!studentId) {
      return NextResponse.json({ error: "Invalid student ID" }, { status: 400 });
    }

    const { name, password, semester, branchId } = await req.json();

    if (!name || !semester || !branchId) {
      return NextResponse.json(
        { error: "Name, Semester, and Branch ID are required" },
        { status: 400 }
      );
    }

    const updateData: any = {
      name,
      semester: Number(semester),
      branchId: Number(branchId),
    };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const student = await prisma.student.update({
      where: { id: studentId },
      data: updateData,
    });

    return NextResponse.json({ success: true, student });
  } catch (error) {
    console.error("Edit student error:", error);
    return NextResponse.json(
      { error: "Failed to update student" },
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
    const studentId = Number(id);

    if (!studentId) {
      return NextResponse.json({ error: "Invalid student ID" }, { status: 400 });
    }

    await prisma.student.delete({
      where: { id: studentId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete student error:", error);
    return NextResponse.json(
      { error: "Failed to delete student" },
      { status: 500 }
    );
  }
}
