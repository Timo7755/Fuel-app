import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const vehicleId = Number(id);

  const latest = await prisma.fuelFillUp.findFirst({
    where: {
      vehicleId,
      userId: session.user.id,
      odometerKm: { not: null },
    },
    orderBy: { date: "desc" },
    select: { odometerKm: true },
  });

  return NextResponse.json({ odometerKm: latest?.odometerKm ?? null });
}
