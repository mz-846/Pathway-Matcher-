import Link from "next/link";
import { FACILITIES } from "@/lib/seed";

const ROW_STYLE: React.CSSProperties = {
  display: "flex",
  gap: "1rem",
  padding: "0.375rem 0",
  borderBottom: "1px solid #f0f4f5",
  alignItems: "baseline",
};

const LABEL_STYLE: React.CSSProperties = {
  minWidth: 96,
  flexShrink: 0,
  whiteSpace: "nowrap",
  fontWeight: 700,
  fontSize: "0.875rem",
  color: "#4c6272",
};

const VALUE_STYLE: React.CSSProperties = {
  margin: 0,
  fontSize: "0.9375rem",
  color: "#212b32",
};

export default function CareHomeSelector() {
  return (
    <>
      <h1 className="nhsuk-heading-xl">Care home portal</h1>
      <p className="nhsuk-body nhsuk-u-margin-bottom-6">
        Select your care home to update today&apos;s availability, view the
        patient waitlist, and manage referrals.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "1.5rem",
          alignItems: "start",
        }}
      >
        {FACILITIES.map((facility) => (
          <div key={facility.id} className="nhsuk-card nhsuk-card--clickable">
            <div className="nhsuk-card__content">
              <h2 className="nhsuk-card__heading nhsuk-heading-m">
                <Link
                  className="nhsuk-card__link"
                  href={`/carehome/${facility.id}`}
                >
                  {facility.name}
                </Link>
              </h2>

              <dl style={{ margin: "0.75rem 0 0", padding: 0, listStyle: "none" }}>
                <div style={ROW_STYLE}>
                  <dt style={LABEL_STYLE}>Region</dt>
                  <dd style={VALUE_STYLE}>{facility.region}</dd>
                </div>
                <div style={ROW_STYLE}>
                  <dt style={LABEL_STYLE}>Beds</dt>
                  <dd style={VALUE_STYLE}>{facility.bedsAvailable} available</dd>
                </div>
                <div style={ROW_STYLE}>
                  <dt style={LABEL_STYLE}>Rating</dt>
                  <dd style={VALUE_STYLE}>{facility.starRating}★</dd>
                </div>
                <div style={{ ...ROW_STYLE, borderBottom: "none" }}>
                  <dt style={LABEL_STYLE}>Languages</dt>
                  <dd style={VALUE_STYLE}>{facility.languages.join(", ")}</dd>
                </div>
              </dl>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
