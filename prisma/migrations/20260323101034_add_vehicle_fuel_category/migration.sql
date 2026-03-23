-- CreateEnum
CREATE TYPE "FuelCategory" AS ENUM ('PETROL', 'DIESEL');

-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "fuelCategory" "FuelCategory" NOT NULL DEFAULT 'PETROL';
