import { NextRequest } from "next/server";
import { updateFacility } from "@/lib/store";
import type { CareType } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const { facilityId, bedsAvailable, careTypes } = await request.json();
  const updated = updateFacility(facilityId, {
    bedsAvailable: Number(bedsAvailable),
    careTypes: careTypes as CareType[],
  });
  if (!updated) {
    return Response.json({ error: "Facility not found" }, { status: 404 });
  }
  return Response.json(updated);
}
