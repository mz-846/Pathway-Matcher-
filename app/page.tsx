import Link from "next/link";

export default function Home() {
  return (
    <div className="nhsuk-width-container" style={{ marginTop: "2rem" }}>
      <h1 className="nhsuk-heading-xl">Pathway Matcher</h1>
      <p className="nhsuk-body nhsuk-u-secondary-text-color">
        NHS Patient Discharge Matching — Demo (synthetic data only)
      </p>
      <div className="nhsuk-grid-row">
        <div className="nhsuk-grid-column-one-half">
          <div className="nhsuk-card">
            <div className="nhsuk-card__content">
              <h2 className="nhsuk-card__heading nhsuk-heading-m">
                Nurse / Discharge Team
              </h2>
              <p className="nhsuk-card__description">
                Find placements, send referrals, track outcomes.
              </p>
              <Link href="/nurse" className="nhsuk-button">
                Open Nurse Interface
              </Link>
            </div>
          </div>
        </div>
        <div className="nhsuk-grid-column-one-half">
          <div className="nhsuk-card">
            <div className="nhsuk-card__content">
              <h2 className="nhsuk-card__heading nhsuk-heading-m">
                Care Home Staff
              </h2>
              <p className="nhsuk-card__description">
                Update availability, accept or decline referrals.
              </p>
              <Link
                href="/carehome"
                className="nhsuk-button nhsuk-button--secondary"
              >
                Open Care Home Interface
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
