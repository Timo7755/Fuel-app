import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const fillUp = await prisma.fuelFillUp.findUnique({
      where: { id: Number(id) },
    });

    if (!fillUp) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (fillUp.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.fuelFillUp.delete({ where: { id: Number(id) } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting fill-up:", error);
    return NextResponse.json(
      { error: "Failed to delete fill-up" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();

    const existing = await prisma.fuelFillUp.findUnique({
      where: { id: Number(id) },
    });

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.fuelFillUp.update({
      where: { id: Number(id) },
      data: {
        date: body.date ? new Date(body.date) : undefined,
        liters: body.liters ?? undefined,
        totalCost: body.totalCost ?? undefined,
        odometerKm: body.odometerKm ?? undefined,
        isFullTank: body.isFulltank ?? undefined,
        fuelType: body.fuelType ?? undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating fill-up:", error);
    return NextResponse.json(
      { error: "Failed to update fill-up" },
      { status: 500 },
    );
  }
}
