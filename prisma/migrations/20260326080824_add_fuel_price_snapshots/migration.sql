-- CreateTable
CREATE TABLE "FuelPriceSnapshot" (
    "id" SERIAL NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "localP95" DOUBLE PRECISION,
    "localDiesel" DOUBLE PRECISION,
    "localP100" DOUBLE PRECISION,
    "localLpg" DOUBLE PRECISION,
    "motorwayP95" DOUBLE PRECISION,
    "motorwayDiesel" DOUBLE PRECISION,
    "motorwayP100" DOUBLE PRECISION,
    "motorwayLpg" DOUBLE PRECISION,

    CONSTRAINT "FuelPriceSnapshot_pkey" PRIMARY KEY ("id")
);
