/*
  Warnings:

  - A unique constraint covering the columns `[studentRoll,subjectId,date]` on the table `Attendance` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Attendance_studentRoll_subjectId_date_key" ON "Attendance"("studentRoll", "subjectId", "date");
