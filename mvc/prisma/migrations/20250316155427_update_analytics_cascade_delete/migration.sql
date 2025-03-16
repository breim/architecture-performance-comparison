-- DropForeignKey
ALTER TABLE "Analytics" DROP CONSTRAINT "Analytics_linkId_fkey";

-- AddForeignKey
ALTER TABLE "Analytics" ADD CONSTRAINT "Analytics_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "Link"("id") ON DELETE CASCADE ON UPDATE CASCADE;
