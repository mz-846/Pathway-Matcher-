import { NextRequest } from "next/server";
import { updateReferral, getFacility, getReferrals } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { status, declineReason } = await request.json();

  const referral = getReferrals().find((r) => r.id === id);
  if (!referral) {
    return Response.json({ error: "Referral not found" }, { status: 404 });
  }

  const facility = getFacility(referral.facilityId);
  const responseMins = facility?.avgResponseMins;

  const updated = updateReferral(id, {
    status,
    declineReason,
    respondedAt: new Date().toISOString(),
    responseMins,
  });

  return Response.json(updated);
}
