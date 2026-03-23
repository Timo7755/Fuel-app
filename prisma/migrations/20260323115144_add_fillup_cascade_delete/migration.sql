-- DropForeignKey
ALTER TABLE "FuelFillUp" DROP CONSTRAINT "FuelFillUp_vehicleId_fkey";

-- AddForeignKey
ALTER TABLE "FuelFillUp" ADD CONSTRAINT "FuelFillUp_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
