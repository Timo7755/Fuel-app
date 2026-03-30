import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const preferredVehicleId =
    typeof body.preferredVehicleId === "number"
      ? body.preferredVehicleId
      : null;

  const preferredRange =
    typeof body.preferredRange === "string" ? body.preferredRange : undefined;

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(body.preferredVehicleId !== undefined ? { preferredVehicleId } : {}),
      ...(preferredRange !== undefined ? { preferredRange } : {}),
    },
  });

  return NextResponse.json({ ok: true });
}
