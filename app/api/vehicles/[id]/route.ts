import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const count = await prisma.fuelFillUp.count({
      where: { vehicleId: Number(id) },
    });
    return NextResponse.json({ fillUpCount: count });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch count" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const vehicle = await prisma.vehicle.update({
      where: { id: Number(id) },
      data: {
        name: body.name,
        fuelCategory: body.fuelCategory,
      },
    });
    return NextResponse.json(vehicle);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update vehicle" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    await prisma.vehicle.delete({
      where: { id: Number(id) },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete vehicle" },
      { status: 500 },
    );
  }
}
