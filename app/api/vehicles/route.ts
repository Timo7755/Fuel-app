import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      orderBy: { id: "asc" },
    });

    return NextResponse.json(vehicles);
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    return NextResponse.json(
      { error: "Failed to fetch vehicles" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body?.name || typeof body.name !== "string") {
      return NextResponse.json(
        { error: "Vehicle name is required" },
        { status: 400 },
      );
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        name: body.name,
        brand: body.brand ?? null,
        model: body.model ?? null,
        year: typeof body.year === "number" ? body.year : null,
        fuelCategory: body.fuelCategory ?? "PETROL",
      },
    });

    return NextResponse.json(vehicle, { status: 201 });
  } catch (error) {
    console.error("Error creating vehicle:", error);
    return NextResponse.json(
      { error: "Failed to create vehicle" },
      { status: 500 },
    );
  }
}
