ALTER TABLE "School" ADD COLUMN "accessCode" TEXT;

CREATE TABLE "StudentCode" (
  "id"        TEXT NOT NULL,
  "schoolId"  TEXT NOT NULL,
  "code"      TEXT NOT NULL,
  "label"     TEXT,
  "maxUses"   INTEGER NOT NULL DEFAULT 10,
  "useCount"  INTEGER NOT NULL DEFAULT 0,
  "isActive"  BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StudentCode_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StudentCode_code_key" ON "StudentCode"("code");

ALTER TABLE "StudentCode" ADD CONSTRAINT "StudentCode_schoolId_fkey"
  FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
