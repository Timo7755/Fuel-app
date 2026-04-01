import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const fillUps = await prisma.fuelFillUp.findMany({
    where: { userId: session.user.id },
    select: { date: true },
    orderBy: { date: "desc" },
  });

  const months = [
    ...new Set(fillUps.map((f) => f.date.toISOString().slice(0, 7))),
  ];

  return NextResponse.json(months);
}
