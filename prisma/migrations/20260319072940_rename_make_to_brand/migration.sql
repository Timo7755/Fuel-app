/*
  Warnings:

  - You are about to drop the column `make` on the `Vehicle` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Vehicle" DROP COLUMN "make",
ADD COLUMN     "brand" TEXT;
