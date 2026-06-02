import { NextRequest } from "next/server";
import { PATIENTS } from "@/lib/seed";
import { getFacilities } from "@/lib/store";
import { extractNeeds, rankFacilities } from "@/lib/match";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const { patientId } = await request.json();
  const patient = PATIENTS.find((p) => p.id === patientId);
  if (!patient) {
    return Response.json({ error: "Patient not found" }, { status: 404 });
  }
  const facilities = getFacilities();
  const extractedNeeds = extractNeeds(patient);
  const rankedMatches = rankFacilities(patient, facilities);
  return Response.json({ extractedNeeds, rankedMatches });
}
