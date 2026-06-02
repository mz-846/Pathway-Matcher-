import { notFound } from "next/navigation";
import { FACILITIES } from "@/lib/seed";
import CareHomeClient from "./CareHomeClient";

export default async function CareHomePage({
  params,
}: {
  params: Promise<{ facilityId: string }>;
}) {
  const { facilityId } = await params;
  const facility = FACILITIES.find((f) => f.id === facilityId);
  if (!facility) notFound();

  return <CareHomeClient facility={facility} />;
}
