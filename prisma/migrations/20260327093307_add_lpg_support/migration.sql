-- AlterEnum
ALTER TYPE "FuelCategory" ADD VALUE 'LPG';

-- AlterEnum
ALTER TYPE "FuelType" ADD VALUE 'LPG';

-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "hasLpg" BOOLEAN NOT NULL DEFAULT false;
