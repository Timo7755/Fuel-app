import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const fillUps = await prisma.fuelFillUp.findMany({
      where: { userId }, // only this user's fill-ups
      orderBy: { date: "desc" },
      include: {
        vehicle: {
          select: { id: true, name: true, brand: true, model: true },
        },
      },
    });

    return NextResponse.json(fillUps);
  } catch (error) {
    console.error("Error fetching fill-ups:", error);
    return NextResponse.json(
      { error: "Failed to fetch fill-ups" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const body = await request.json();

    // basic validation
    if (typeof body?.vehicleId !== "number") {
      return NextResponse.json(
        { error: "vehicleId (number) is required" },
        { status: 400 },
      );
    }

    if (typeof body?.date !== "string") {
      return NextResponse.json({ error: "date is required" }, { status: 400 });
    }

    if (typeof body?.liters !== "number" || body.liters <= 0) {
      return NextResponse.json(
        { error: "liters must be a positive number" },
        { status: 400 },
      );
    }

    if (typeof body?.totalCost !== "number" || body.totalCost <= 0) {
      return NextResponse.json(
        { error: "totalCost must be a positive number" },
        { status: 400 },
      );
    }

    const fillUp = await prisma.fuelFillUp.create({
      data: {
        vehicleId: body.vehicleId,
        date: new Date(body.date),
        liters: body.liters,
        totalCost: body.totalCost,
        odometerKm:
          typeof body.odometerKm === "number" ? body.odometerKm : null,
        isFullTank:
          typeof body.isFullTank === "boolean" ? body.isFullTank : true,
        fuelType: body.fuelType ?? "PETROL_95",
        userId,
      },
    });

    return NextResponse.json(fillUp, { status: 201 });
  } catch (error) {
    console.error("Error creating fill-up:", error);
    return NextResponse.json(
      { error: "Failed to create fill-up" },
      { status: 500 },
    );
  }
}
