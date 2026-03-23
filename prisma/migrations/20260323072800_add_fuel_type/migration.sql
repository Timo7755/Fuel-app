-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('DIESEL', 'PETROL_95', 'PETROL_100');

-- AlterTable
ALTER TABLE "FuelFillUp" ADD COLUMN     "fuelType" "FuelType" NOT NULL DEFAULT 'PETROL_95';
