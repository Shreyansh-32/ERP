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
    const teacherId = Number(id);

    if (!teacherId) {
      return NextResponse.json({ error: "Invalid teacher ID" }, { status: 400 });
    }

    const { name, password, branchId } = await req.json();

    if (!name || !branchId) {
      return NextResponse.json(
        { error: "Name and Branch ID are required" },
        { status: 400 }
      );
    }

    const updateData: any = {
      name,
      branchId,
    };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const teacher = await prisma.teacher.update({
      where: { id: teacherId },
      data: updateData,
    });

    return NextResponse.json({ success: true, teacher });
  } catch (error) {
    console.error("Edit teacher error:", error);
    return NextResponse.json(
      { error: "Failed to update teacher" },
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
    const teacherId = Number(id);

    if (!teacherId) {
      return NextResponse.json({ error: "Invalid teacher ID" }, { status: 400 });
    }

    await prisma.teacher.delete({
      where: { id: teacherId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete teacher error:", error);
    return NextResponse.json(
      { error: "Failed to delete teacher" },
      { status: 500 }
    );
  }
}
