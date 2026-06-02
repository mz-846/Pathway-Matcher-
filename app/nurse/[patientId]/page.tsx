import Link from "next/link";
import { notFound } from "next/navigation";
import { PATIENTS } from "@/lib/seed";
import FhirForm from "./FhirForm";

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = await params;
  const patient = PATIENTS.find((p) => p.id === patientId);
  if (!patient) notFound();

  const savings = 330 * patient.medicallyFitSinceDays;

  return (
    <>
      <Link href="/nurse" className="nhsuk-back-link">
        <svg
          className="nhsuk-icon nhsuk-icon__chevron-left"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          aria-hidden="true"
          height="24"
          width="24"
        >
          <path d="M8.5 12c0-.3.1-.5.3-.7l5-5 1.4 1.4-4.3 4.3 4.3 4.3-1.4 1.4-5-5c-.2-.2-.3-.4-.3-.7z" />
        </svg>
        All patients
      </Link>

      <h1 className="nhsuk-heading-xl">{patient.name}</h1>

      <dl className="nhsuk-summary-list nhsuk-summary-list--no-border">
        <div className="nhsuk-summary-list__row">
          <dt className="nhsuk-summary-list__key">Age</dt>
          <dd className="nhsuk-summary-list__value">{patient.age}</dd>
        </div>
        <div className="nhsuk-summary-list__row">
          <dt className="nhsuk-summary-list__key">Medically fit since</dt>
          <dd className="nhsuk-summary-list__value">
            {patient.medicallyFitSinceDays} day
            {patient.medicallyFitSinceDays !== 1 ? "s" : ""} ago
          </dd>
        </div>
      </dl>

      <div className="nhsuk-warning-callout">
        <h3 className="nhsuk-warning-callout__label">
          <span role="text">
            <span className="nhsuk-u-visually-hidden">Important: </span>
            System savings
          </span>
        </h3>
        <p>
          Medically fit for{" "}
          <strong>{patient.medicallyFitSinceDays} days</strong> — estimated
          cost: <strong>£{savings.toLocaleString()}</strong> at £330/night.
          Discharging today reclaims that spend.
        </p>
      </div>

      {/* FHIR auto-fill form — drives matching */}
      <FhirForm patient={patient} />

      <div style={{ marginTop: "1.5rem" }}>
        <Link
          href={`/nurse/${patientId}/referrals`}
          className="nhsuk-button nhsuk-button--secondary"
        >
          View referral tracker
        </Link>
      </div>
    </>
  );
}
