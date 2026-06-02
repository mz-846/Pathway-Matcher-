import Link from "next/link";
import { PATIENTS } from "@/lib/seed";

export default function NursePage() {
  return (
    <>
      <h1 className="nhsuk-heading-xl">Patients awaiting discharge</h1>
      <div className="nhsuk-grid-row">
        {PATIENTS.map((patient) => {
          const savings = 330 * patient.medicallyFitSinceDays;
          return (
            <div className="nhsuk-grid-column-one-half" key={patient.id}>
              <div className="nhsuk-card nhsuk-card--clickable">
                <div className="nhsuk-card__content">
                  <h2 className="nhsuk-card__heading nhsuk-heading-m">
                    <Link
                      className="nhsuk-card__link"
                      href={`/nurse/${patient.id}`}
                    >
                      {patient.name}
                    </Link>
                  </h2>
                  <dl className="nhsuk-summary-list nhsuk-summary-list--no-border">
                    <div className="nhsuk-summary-list__row">
                      <dt className="nhsuk-summary-list__key">Age</dt>
                      <dd className="nhsuk-summary-list__value">{patient.age}</dd>
                    </div>
                    <div className="nhsuk-summary-list__row">
                      <dt className="nhsuk-summary-list__key">Diagnosis</dt>
                      <dd className="nhsuk-summary-list__value">
                        {patient.diagnosis}
                      </dd>
                    </div>
                    <div className="nhsuk-summary-list__row">
                      <dt className="nhsuk-summary-list__key">Region</dt>
                      <dd className="nhsuk-summary-list__value">
                        {patient.region}
                      </dd>
                    </div>
                    <div className="nhsuk-summary-list__row">
                      <dt className="nhsuk-summary-list__key">
                        Medically fit (days)
                      </dt>
                      <dd className="nhsuk-summary-list__value">
                        {patient.medicallyFitSinceDays}
                      </dd>
                    </div>
                  </dl>
                  <div
                    className="nhsuk-warning-callout"
                    style={{ marginTop: "1rem" }}
                  >
                    <h3 className="nhsuk-warning-callout__label">
                      <span role="text">
                        <span className="nhsuk-u-visually-hidden">
                          Important:{" "}
                        </span>
                        Estimated bed savings
                      </span>
                    </h3>
                    <p>
                      £{savings.toLocaleString()} reclaimed at £330/night ×{" "}
                      {patient.medicallyFitSinceDays} days
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
