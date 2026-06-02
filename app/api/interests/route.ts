import { NextRequest } from "next/server";
import { getInterests, addInterest } from "@/lib/store";
import type { Interest } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const patientId = searchParams.get("patientId");
  const facilityId = searchParams.get("facilityId");
  let interests = getInterests();
  if (patientId) interests = interests.filter((i) => i.patientId === patientId);
  if (facilityId) interests = interests.filter((i) => i.facilityId === facilityId);
  return Response.json(interests);
}

export async function POST(request: NextRequest) {
  const { facilityId, patientId } = await request.json();
  // Idempotent — return existing if already registered
  const existing = getInterests().find(
    (i) => i.facilityId === facilityId && i.patientId === patientId
  );
  if (existing) return Response.json(existing);

  const interest: Interest = {
    id: `int-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    facilityId,
    patientId,
    expressedAt: new Date().toISOString(),
  };
  addInterest(interest);
  return Response.json(interest, { status: 201 });
}
