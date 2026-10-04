-- CreateTable
CREATE TABLE "student_activities" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "activity_type" TEXT NOT NULL,
    "source" TEXT,
    "payload" JSONB,
    "occurred_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "student_activities_organization_id_idx" ON "student_activities"("organization_id");

-- CreateIndex
CREATE INDEX "student_activities_student_id_idx" ON "student_activities"("student_id");

-- CreateIndex
CREATE INDEX "student_activities_organization_id_student_id_occurred_at_idx" ON "student_activities"("organization_id", "student_id", "occurred_at");

-- AddForeignKey
ALTER TABLE "student_activities" ADD CONSTRAINT "student_activities_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_activities" ADD CONSTRAINT "student_activities_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
