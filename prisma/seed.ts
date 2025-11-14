import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  /* -------------------------
     HASH PASSWORDS
  -------------------------- */
  const adminPassword = await bcrypt.hash("admin123", 10);
  const teacherPassword = await bcrypt.hash("teacher123", 10);
  const studentPassword = await bcrypt.hash("student123", 10);

  /* -------------------------
     CREATE BRANCH
  -------------------------- */
  const cse = await prisma.branch.create({
    data: {
      name: "Computer Science & Engineering",
    },
  });

  /* -------------------------
     CREATE ADMIN
  -------------------------- */
  const admin = await prisma.admin.create({
    data: {
      employeeId: "A-001",
      name: "System Admin",
      email: "admin@gectest.edu",
      password: adminPassword,
      createdBranches: {
        connect: [{ id: cse.id }],
      },
    },
  });

  /* -------------------------
     CREATE TEACHERS
  -------------------------- */
  const teacher1 = await prisma.teacher.create({
    data: {
      employeeId: "T-101",
      name: "Prof. Priya Das",
      password: teacherPassword,
      branchId: cse.id,
      createdById: admin.id,
    },
  });

  const teacher2 = await prisma.teacher.create({
    data: {
      employeeId: "T-102",
      name: "Prof. Sonia Wadhwa",
      password: teacherPassword,
      branchId: cse.id,
      createdById: admin.id,
    },
  });

  /* -------------------------
     CREATE SUBJECTS
  -------------------------- */
  const subject1 = await prisma.subject.create({
    data: {
      name: "Machine Learning",
      semester: 7,
      branchId: cse.id,
      teachers: {
        connect: [{ id: teacher1.id }],
      },
    },
  });

  const subject2 = await prisma.subject.create({
    data: {
      name: "Data Mining & Warehousing",
      semester: 7,
      branchId: cse.id,
      teachers: {
        connect: [{ id: teacher2.id }],
      },
    },
  });

  /* -------------------------
     CREATE STUDENTS (5)
  -------------------------- */
  const studentsData = [
    { roll: "300702222016", name: "Shreyansh Thakur" },
    { roll: "300702222012", name: "Anurag Chandra" },
    { roll: "300702222006", name: "Govind Ojha" },
  ];

  for (const s of studentsData) {
    await prisma.student.create({
      data: {
        roll: s.roll,
        name: s.name,
        password: studentPassword,
        semester: 3,
        branchId: cse.id,
        createdById: admin.id,
      },
    });
  }

  console.log("🌱 Seeding completed successfully!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((error) => {
    console.error("❌ Seeding error:", error);
    prisma.$disconnect();
    process.exit(1);
  });
