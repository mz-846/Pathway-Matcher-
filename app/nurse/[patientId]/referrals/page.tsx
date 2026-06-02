import { PATIENTS } from "@/lib/seed";
import { notFound } from "next/navigation";
import ReferralTracker from "./ReferralTracker";

export default async function ReferralsPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = await params;
  const patient = PATIENTS.find((p) => p.id === patientId);
  if (!patient) notFound();

  return (
    <>
      <h1 className="nhsuk-heading-xl">Referral tracker</h1>
      <p className="nhsuk-body nhsuk-u-secondary-text-color">
        {patient.name} &mdash; {patient.diagnosis}
      </p>
      <ReferralTracker patientId={patientId} />
    </>
  );
}
