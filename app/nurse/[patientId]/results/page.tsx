import { notFound } from "next/navigation";
import Link from "next/link";
import { PATIENTS } from "@/lib/seed";
import { getFacilities } from "@/lib/store";
import { extractNeeds, rankFacilities } from "@/lib/match";
import type { Patient, Region } from "@/lib/types";
import SendReferralButton from "./SendReferralButton";

const CARE_TYPE_LABELS: Record<string, string> = {
  dementia: "Dementia care",
  hoist: "Hoist / 2-person transfer",
  salt: "Speech & language therapy",
  "night-nursing": "Night nursing",
  "general-rehab": "General rehabilitation",
};

type SearchParams = Promise<{
  summary?: string;
  careTypes?: string;
  region?: string;
  diagnosis?: string;
  preferredLanguage?: string;
}>;

export default async function ResultsPage({
  params,
  searchParams,
}: {
  params: Promise<{ patientId: string }>;
  searchParams: SearchParams;
}) {
  const { patientId } = await params;
  const sp = await searchParams;

  const seedPatient = PATIENTS.find((p) => p.id === patientId);
  if (!seedPatient) notFound();

  // Apply nurse edits from the FHIR/image form (passed as URL query params)
  const patient: Patient = {
    ...seedPatient,
    ...(sp.summary != null && { summary: sp.summary }),
    ...(sp.diagnosis != null && { diagnosis: sp.diagnosis }),
    ...(sp.region != null && { region: sp.region as Region }),
    ...(sp.careTypes != null && {
      therapies: sp.careTypes.split(",").filter(Boolean),
    }),
    ...(sp.preferredLanguage
      ? { preferredLanguage: sp.preferredLanguage }
      : {}),
  };

  const fromForm = !!(sp.summary || sp.careTypes || sp.region || sp.preferredLanguage);

  const facilities = getFacilities();
  const extractedNeeds = extractNeeds(patient);
  const rankedMatches = rankFacilities(patient, facilities);
  const facilityMap = Object.fromEntries(facilities.map((f) => [f.id, f]));

  return (
    <>
      <Link href={`/nurse/${patientId}`} className="nhsuk-back-link">
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
        Back to {seedPatient.name}
      </Link>

      <h1 className="nhsuk-heading-xl">Placement results</h1>

      <p className="nhsuk-body nhsuk-u-secondary-text-color">
        {patient.name} &mdash; {patient.diagnosis}
      </p>

      {fromForm && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            backgroundColor: "#e8f4e8",
            border: "1px solid #007f3b",
            borderRadius: "4px",
            padding: "0.625rem 1rem",
            marginBottom: "1.25rem",
            fontSize: "0.875rem",
            color: "#007f3b",
            fontWeight: "bold",
          }}
        >
          <span>✓</span>
          <span>Matching against nurse-reviewed discharge requirements</span>
        </div>
      )}

      {/* Extracted needs tags */}
      <h2 className="nhsuk-heading-s" style={{ marginBottom: "0.5rem" }}>
        Care needs used for matching
      </h2>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem",
          marginBottom: "1.75rem",
        }}
      >
        {extractedNeeds.careTypes.length === 0 ? (
          <span className="nhsuk-tag nhsuk-tag--grey">
            No specific needs identified
          </span>
        ) : (
          extractedNeeds.careTypes.map((ct) => (
            <span key={ct} className="nhsuk-tag">
              {CARE_TYPE_LABELS[ct] ?? ct}
            </span>
          ))
        )}
        <span className="nhsuk-tag nhsuk-tag--blue">
          {extractedNeeds.region}
        </span>
        {patient.preferredLanguage && (
          <span className="nhsuk-tag nhsuk-tag--purple">
            Language: {patient.preferredLanguage}
          </span>
        )}
      </div>

      {/* Ranked facility cards */}
      {rankedMatches.map((match) => {
        const facility = facilityMap[match.facilityId];
        if (!facility) return null;

        const isExcluded = match.excluded;
        const isFull = !isExcluded && match.fit === "full";

        const accentColor = isExcluded
          ? "#768692"
          : isFull
          ? "#007f3b"
          : "#f47738";

        // Language gaps are prose strings from match.ts; care-type gaps are careType IDs
        const langGaps = match.gaps.filter((g) => g.includes("speaking carers"));
        const ctGaps = match.gaps.filter((g) => !g.includes("speaking carers"));

        return (
          <div
            key={match.facilityId}
            style={{
              border: "1px solid #d8dde0",
              borderLeft: `5px solid ${accentColor}`,
              borderRadius: "4px",
              backgroundColor: "#fff",
              marginBottom: "1.25rem",
              opacity: isExcluded ? 0.65 : 1,
              overflow: "hidden",
            }}
          >
            {/* Card header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1rem 1.25rem 0.75rem",
                flexWrap: "wrap",
                gap: "0.5rem",
                borderBottom: "1px solid #f0f4f5",
              }}
            >
              <h2
                style={{
                  fontSize: "1.1875rem",
                  fontWeight: "bold",
                  margin: 0,
                  color: "#212b32",
                }}
              >
                {facility.name}
              </h2>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  flexShrink: 0,
                }}
              >
                {isExcluded ? (
                  <span className="nhsuk-tag nhsuk-tag--grey">
                    {match.excludedReason}
                  </span>
                ) : isFull ? (
                  <span className="nhsuk-tag nhsuk-tag--green">Full match</span>
                ) : (
                  <span
                    className="nhsuk-tag"
                    style={{ backgroundColor: "#f47738", color: "#fff" }}
                  >
                    Partial match
                  </span>
                )}
                {!isExcluded && (
                  <span
                    style={{
                      fontWeight: "bold",
                      fontSize: "1.5rem",
                      color: accentColor,
                      lineHeight: 1,
                      minWidth: "3rem",
                      textAlign: "right",
                    }}
                  >
                    {match.score}%
                  </span>
                )}
              </div>
            </div>

            {/* Card body */}
            <div style={{ padding: "0.875rem 1.25rem" }}>
              {/* Quick stats */}
              <div
                style={{
                  display: "flex",
                  gap: "1.5rem",
                  flexWrap: "wrap",
                  marginBottom: "0.875rem",
                  fontSize: "0.875rem",
                  color: "#425563",
                }}
              >
                <span>
                  <strong style={{ color: "#212b32" }}>
                    {facility.bedsAvailable}
                  </strong>{" "}
                  bed{facility.bedsAvailable !== 1 ? "s" : ""} available
                </span>
                <span>
                  <strong style={{ color: "#212b32" }}>
                    {facility.starRating}★
                  </strong>{" "}
                  rating
                </span>
                <span>
                  Avg response{" "}
                  <strong style={{ color: "#212b32" }}>
                    {facility.avgResponseMins} min
                  </strong>
                </span>
                <span style={{ color: "#4c6272" }}>{facility.region}</span>
                {facility.languages.length > 0 && (
                  <span>
                    Languages:{" "}
                    <strong style={{ color: "#212b32" }}>
                      {facility.languages.map((lang) => {
                        const isPreferred =
                          patient.preferredLanguage === lang;
                        return isPreferred ? (
                          <span
                            key={lang}
                            style={{ color: "#007f3b" }}
                          >
                            {lang} ✓{" "}
                          </span>
                        ) : (
                          <span key={lang}>{lang} </span>
                        );
                      })}
                    </strong>
                  </span>
                )}
              </div>

              {/* Match reasons */}
              {!isExcluded && match.matchReasons.length > 0 && (
                <ul
                  style={{
                    margin: "0 0 0.75rem",
                    padding: 0,
                    listStyle: "none",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.25rem",
                  }}
                >
                  {match.matchReasons.map((r) => (
                    <li
                      key={r}
                      style={{
                        fontSize: "0.9375rem",
                        color: "#212b32",
                        display: "flex",
                        alignItems: "baseline",
                        gap: "0.375rem",
                      }}
                    >
                      <span
                        style={{
                          color: "#007f3b",
                          fontWeight: "bold",
                          flexShrink: 0,
                        }}
                      >
                        ✓
                      </span>
                      {r}
                    </li>
                  ))}
                </ul>
              )}

              {/* Care-type gaps */}
              {!isExcluded && ctGaps.length > 0 && (
                <div
                  style={{
                    backgroundColor: "#fff4e5",
                    border: "1px solid #ffb81c",
                    borderLeft: "4px solid #ffb81c",
                    borderRadius: "4px",
                    padding: "0.625rem 0.875rem",
                    marginBottom: "0.625rem",
                    fontSize: "0.875rem",
                  }}
                >
                  <strong style={{ color: "#594d00" }}>Care gaps: </strong>
                  <span style={{ color: "#594d00" }}>
                    {ctGaps.map((g) => CARE_TYPE_LABELS[g] ?? g).join(", ")} not
                    provided.
                  </span>
                </div>
              )}

              {/* Language gaps */}
              {!isExcluded && langGaps.length > 0 && (
                <div
                  style={{
                    backgroundColor: "#fef3f2",
                    border: "1px solid #d5281b",
                    borderLeft: "4px solid #d5281b",
                    borderRadius: "4px",
                    padding: "0.625rem 0.875rem",
                    marginBottom: "0.625rem",
                    fontSize: "0.875rem",
                  }}
                >
                  <strong style={{ color: "#d5281b" }}>Language gap: </strong>
                  <span style={{ color: "#d5281b" }}>{langGaps.join(", ")}.</span>
                </div>
              )}

              {!isExcluded && (
                <div style={{ marginTop: "0.875rem" }}>
                  <SendReferralButton
                    patientId={patientId}
                    facilityId={match.facilityId}
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}

      <Link
        href={`/nurse/${patientId}/referrals`}
        className="nhsuk-button nhsuk-button--secondary"
        style={{ marginTop: "0.5rem" }}
      >
        View referral tracker
      </Link>
    </>
  );
}
