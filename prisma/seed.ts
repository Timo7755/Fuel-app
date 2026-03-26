import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const EMAIL = process.argv[2];

if (!EMAIL) {
  console.error("Usage: npm run seed -- your@email.com");
  process.exit(1);
}

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

async function main() {
  const user = await prisma.user.findUnique({ where: { email: EMAIL } });
  if (!user) {
    console.error(`No user found with email: ${EMAIL}`);
    process.exit(1);
  }

  // Use existing vehicle or create one
  let vehicle = await prisma.vehicle.findFirst({ where: { userId: user.id } });
  if (!vehicle) {
    vehicle = await prisma.vehicle.create({
      data: {
        name: "VW Golf",
        brand: "Volkswagen",
        model: "Golf",
        year: 2019,
        fuelCategory: "PETROL",
        userId: user.id,
      },
    });
    console.log("Created vehicle: VW Golf");
  } else {
    console.log(`Using existing vehicle: ${vehicle.name}`);
  }

  const now = new Date();
  const startDate = new Date(
    now.getFullYear(),
    now.getMonth() - 7,
    now.getDate(),
  );

  let currentDate = startDate;
  let odometer = 87500;
  const fillUps = [];

  while (currentDate < now) {
    const kmDriven = Math.round(rand(400, 600));
    odometer += kmDriven;

    // Slovenian petrol 95 prices with slight month-to-month drift
    const monthOffset =
      (currentDate.getMonth() - startDate.getMonth() + 12) % 12;
    const basePrice = 1.48 + monthOffset * 0.005 + rand(-0.06, 0.06);

    // 25% chance of motorway stop (more expensive)
    const isMotorway = Math.random() < 0.25;
    const pricePerLiter = basePrice + (isMotorway ? rand(0.08, 0.14) : 0);

    // 80% chance of full tank
    const isFullTank = Math.random() > 0.2;
    const liters = isFullTank ? rand(40, 48) : rand(22, 39);
    const totalCost = liters * pricePerLiter;

    fillUps.push({
      date: new Date(currentDate),
      liters: Math.round(liters * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      odometerKm: odometer,
      isFullTank,
      fuelType: "PETROL_95" as const,
      vehicleId: vehicle.id,
      userId: user.id,
    });

    // Fill up every 10-15 days
    currentDate = addDays(currentDate, Math.round(rand(10, 15)));
  }

  await prisma.fuelFillUp.createMany({ data: fillUps });

  console.log(`✓ Inserted ${fillUps.length} fill-ups`);
  console.log(
    `  Period: ${fillUps[0].date.toLocaleDateString("en-GB")} → ${fillUps[fillUps.length - 1].date.toLocaleDateString("en-GB")}`,
  );
  console.log(`  Odometer: 87,500 → ${odometer.toLocaleString()} km`);
  console.log(
    `  Avg €/L: €${(fillUps.reduce((s, f) => s + f.totalCost / f.liters, 0) / fillUps.length).toFixed(3)}`,
  );
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
