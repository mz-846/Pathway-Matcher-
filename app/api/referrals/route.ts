import { NextRequest } from "next/server";
import { getReferrals, addReferral, getFacility } from "@/lib/store";
import type { Referral } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const patientId = searchParams.get("patientId");
  const facilityId = searchParams.get("facilityId");
  let referrals = getReferrals();
  if (patientId) referrals = referrals.filter((r) => r.patientId === patientId);
  if (facilityId)
    referrals = referrals.filter((r) => r.facilityId === facilityId);
  return Response.json(referrals);
}

export async function POST(request: NextRequest) {
  const { patientId, facilityId } = await request.json();
  const facility = getFacility(facilityId);
  if (!facility) {
    return Response.json({ error: "Facility not found" }, { status: 404 });
  }
  const referral: Referral = {
    id: `ref-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    patientId,
    facilityId,
    status: "sent",
    sentAt: new Date().toISOString(),
  };
  addReferral(referral);
  return Response.json(referral, { status: 201 });
}
