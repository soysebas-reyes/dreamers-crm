-- CreateEnum
CREATE TYPE "ToolStatus" AS ENUM ('SUGGESTED', 'USED');

-- CreateTable
CREATE TABLE "affiliate_tool" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT,
    "category" TEXT,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "affiliate_tool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dreamer_tool" (
    "id" UUID NOT NULL,
    "dreamer_id" UUID NOT NULL,
    "tool_id" UUID NOT NULL,
    "status" "ToolStatus" NOT NULL DEFAULT 'SUGGESTED',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dreamer_tool_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "affiliate_tool_name_key" ON "affiliate_tool"("name");

-- CreateIndex
CREATE INDEX "dreamer_tool_dreamer_id_idx" ON "dreamer_tool"("dreamer_id");

-- CreateIndex
CREATE INDEX "dreamer_tool_tool_id_idx" ON "dreamer_tool"("tool_id");

-- CreateIndex
CREATE UNIQUE INDEX "dreamer_tool_dreamer_id_tool_id_key" ON "dreamer_tool"("dreamer_id", "tool_id");

-- AddForeignKey
ALTER TABLE "dreamer_tool" ADD CONSTRAINT "dreamer_tool_dreamer_id_fkey" FOREIGN KEY ("dreamer_id") REFERENCES "dreamer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dreamer_tool" ADD CONSTRAINT "dreamer_tool_tool_id_fkey" FOREIGN KEY ("tool_id") REFERENCES "affiliate_tool"("id") ON DELETE CASCADE ON UPDATE CASCADE;
