-- AlterTable
ALTER TABLE "User" ADD COLUMN     "preferredVehicleId" INTEGER;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_preferredVehicleId_fkey" FOREIGN KEY ("preferredVehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
