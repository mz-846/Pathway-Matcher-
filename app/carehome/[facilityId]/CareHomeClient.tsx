"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import type { Facility, Referral, CareType } from "@/lib/types";
import { PATIENTS } from "@/lib/seed";
import { rankFacilities, extractNeeds } from "@/lib/match";

// ─── constants ────────────────────────────────────────────────────────────────

const ALL_CARE_TYPES: { value: string; label: string }[] = [
  { value: "dementia", label: "Dementia care" },
  { value: "hoist", label: "Hoist / 2-person transfer" },
  { value: "salt", label: "Speech & language therapy" },
  { value: "night-nursing", label: "Night nursing" },
  { value: "general-rehab", label: "General rehabilitation" },
];

const CARE_TYPE_LABELS: Record<string, string> = {
  dementia: "Dementia",
  hoist: "Hoist",
  salt: "SALT",
  "night-nursing": "Night nursing",
  "general-rehab": "Rehab",
};

const PATIENT_MAP = Object.fromEntries(PATIENTS.map((p) => [p.id, p]));

const STATUS_TAG: Record<string, { label: string; cls: string }> = {
  sent: { label: "Sent", cls: "nhsuk-tag--blue" },
  accepted: { label: "Accepted", cls: "nhsuk-tag--green" },
  declined: { label: "Declined", cls: "nhsuk-tag--red" },
};

type Tab = "availability" | "waitlist" | "inbox";

// ─── Tab bar ──────────────────────────────────────────────────────────────────

function TabBar({
  active,
  onSelect,
  inboxCount,
}: {
  active: Tab;
  onSelect: (t: Tab) => void;
  inboxCount: number;
}) {
  const tabs: { id: Tab; label: string; badge?: number }[] = [
    { id: "availability", label: "Today's availability" },
    { id: "waitlist", label: "Patients waiting" },
    { id: "inbox", label: "Referral inbox", badge: inboxCount },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 0,
        borderBottom: "3px solid #d8dde0",
        marginBottom: "2rem",
      }}
      role="tablist"
    >
      {tabs.map(({ id, label, badge }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(id)}
            style={{
              padding: "0.875rem 1.75rem",
              border: "none",
              borderBottom: isActive
                ? "3px solid #005eb8"
                : "3px solid transparent",
              marginBottom: "-3px",
              backgroundColor: isActive ? "#f0f4f5" : "transparent",
              color: isActive ? "#005eb8" : "#425563",
              fontWeight: isActive ? 700 : 400,
              fontSize: "1rem",
              cursor: "pointer",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontFamily: "inherit",
              transition: "background-color 0.1s",
            }}
          >
            {label}
            {badge != null && badge > 0 && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: 22,
                  height: 22,
                  borderRadius: 11,
                  backgroundColor: "#d5281b",
                  color: "#fff",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  padding: "0 0.3rem",
                }}
              >
                {badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export default function CareHomeClient({ facility }: { facility: Facility }) {
  const [activeTab, setActiveTab] = useState<Tab>("availability");

  // Availability state
  const [beds, setBeds] = useState(facility.bedsAvailable);
  const [careTypes, setCareTypes] = useState<string[]>(
    facility.careTypes as string[]
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Referral inbox
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Express-interest tracking (session only)
  const [expressedInterests, setExpressedInterests] = useState<Set<string>>(
    new Set()
  );

  const poll = useCallback(async () => {
    const res = await fetch(`/api/referrals?facilityId=${facility.id}`, {
      cache: "no-store",
    });
    if (res.ok) {
      setReferrals(await res.json());
      setLastUpdated(new Date());
    }
  }, [facility.id]);

  useEffect(() => {
    poll();
    const id = setInterval(poll, 2000);
    return () => clearInterval(id);
  }, [poll]);

  // Compute waitlist using current care-type state
  const { matchingPatients, otherPatients } = useMemo(() => {
    const virtualFacility: Facility = {
      ...facility,
      bedsAvailable: beds,
      careTypes: careTypes as CareType[],
    };
    const scored = PATIENTS.map((p) => ({
      patient: p,
      match: rankFacilities(p, [virtualFacility])[0],
    }));
    return {
      matchingPatients: scored.filter((r) => !r.match.excluded),
      otherPatients: scored.filter((r) => r.match.excluded),
    };
  }, [facility, beds, careTypes]);

  async function saveAvailability() {
    setSaving(true);
    await fetch("/api/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        facilityId: facility.id,
        bedsAvailable: beds,
        careTypes,
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function respond(referralId: string, status: "accepted" | "declined") {
    await fetch(`/api/referrals/${referralId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        declineReason:
          status === "declined" ? "No staff available" : undefined,
      }),
    });
    await poll();
  }

  async function expressInterest(patientId: string) {
    await fetch("/api/interests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ facilityId: facility.id, patientId }),
    });
    setExpressedInterests((prev) => new Set([...prev, patientId]));
  }

  function toggleCareType(ct: string) {
    setCareTypes((prev) =>
      prev.includes(ct) ? prev.filter((x) => x !== ct) : [...prev, ct]
    );
    setSaved(false);
  }

  const pendingReferrals = referrals.filter((r) => r.status === "sent");
  const handledReferrals = referrals.filter((r) => r.status !== "sent");

  return (
    <>
      <Link href="/carehome" className="nhsuk-back-link">
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
        All care homes
      </Link>

      <h1 className="nhsuk-heading-xl nhsuk-u-margin-bottom-2">
        {facility.name}
      </h1>
      <p className="nhsuk-body nhsuk-u-secondary-text-color nhsuk-u-margin-bottom-6">
        {facility.region} &middot; {facility.starRating}★ &middot; avg{" "}
        {facility.avgResponseMins} min response
      </p>

      {/* ── Horizontal tab bar ──────────────────────────────────────── */}
      <TabBar
        active={activeTab}
        onSelect={setActiveTab}
        inboxCount={pendingReferrals.length}
      />

      {/* ── TAB: Today's availability ────────────────────────────────── */}
      {activeTab === "availability" && (
        <div className="nhsuk-grid-row">
          <div className="nhsuk-grid-column-two-thirds">
            <h2 className="nhsuk-heading-m nhsuk-u-margin-bottom-4">
              Update today&apos;s availability
            </h2>

            <div className="nhsuk-form-group nhsuk-u-margin-bottom-6">
              <label
                className="nhsuk-label nhsuk-u-font-weight-bold"
                htmlFor="ch-beds"
              >
                Beds available
              </label>
              <div className="nhsuk-hint">
                Number of beds currently free for new patients.
              </div>
              <input
                className="nhsuk-input nhsuk-input--width-4"
                id="ch-beds"
                type="number"
                min={0}
                max={20}
                value={beds}
                onChange={(e) => {
                  setBeds(Number(e.target.value));
                  setSaved(false);
                }}
              />
            </div>

            <div className="nhsuk-form-group nhsuk-u-margin-bottom-6">
              <fieldset className="nhsuk-fieldset">
                <legend className="nhsuk-fieldset__legend nhsuk-fieldset__legend--s">
                  <h3 className="nhsuk-fieldset__heading">
                    Care types provided
                  </h3>
                </legend>
                <div className="nhsuk-hint nhsuk-u-margin-bottom-3">
                  Tick all types of care your home can currently accommodate.
                </div>
                <div className="nhsuk-checkboxes">
                  {ALL_CARE_TYPES.map(({ value, label }) => (
                    <div
                      className="nhsuk-checkboxes__item"
                      key={value}
                    >
                      <input
                        className="nhsuk-checkboxes__input"
                        id={`ch-ct-${value}`}
                        type="checkbox"
                        checked={careTypes.includes(value)}
                        onChange={() => toggleCareType(value)}
                      />
                      <label
                        className="nhsuk-label nhsuk-checkboxes__label"
                        htmlFor={`ch-ct-${value}`}
                      >
                        {label}
                      </label>
                    </div>
                  ))}
                </div>
              </fieldset>
            </div>

            <div className="nhsuk-form-group nhsuk-u-margin-bottom-6">
              <p className="nhsuk-label nhsuk-u-font-weight-bold">
                Languages offered
              </p>
              <p className="nhsuk-body nhsuk-u-margin-bottom-0">
                {facility.languages.join(", ")}
              </p>
            </div>

            <button
              className={`nhsuk-button nhsuk-u-margin-bottom-0${
                saved ? " nhsuk-button--secondary" : ""
              }`}
              onClick={saveAvailability}
              disabled={saving}
            >
              {saving ? "Saving…" : saved ? "✓ Saved" : "Update availability"}
            </button>
          </div>
        </div>
      )}

      {/* ── TAB: Patients waiting ────────────────────────────────────── */}
      {activeTab === "waitlist" && (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              flexWrap: "wrap",
              gap: "0.5rem",
              marginBottom: "1.5rem",
            }}
          >
            <h2 className="nhsuk-heading-m nhsuk-u-margin-bottom-0">
              Patients waiting for placement
            </h2>
            {lastUpdated && (
              <span
                className="nhsuk-u-secondary-text-color"
                style={{ fontSize: "0.875rem" }}
              >
                Live · polling every 2s · {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>

          {matchingPatients.length > 0 && (
            <div className="nhsuk-u-margin-bottom-6">
              <h3
                className="nhsuk-heading-s nhsuk-u-margin-bottom-3"
                style={{ color: "#007f3b" }}
              >
                Matches your home
              </h3>
              <div className="nhsuk-grid-row">
                {matchingPatients.map(({ patient, match }) => {
                  const needs = extractNeeds(patient);
                  const alreadyInterested = expressedInterests.has(
                    patient.id
                  );
                  const langOk =
                    patient.preferredLanguage &&
                    facility.languages.includes(patient.preferredLanguage);
                  return (
                    <div
                      key={patient.id}
                      className="nhsuk-grid-column-one-half"
                    >
                      <div
                        className="nhsuk-card"
                        style={{ borderLeft: "4px solid #007f3b" }}
                      >
                        <div className="nhsuk-card__content">
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              gap: "0.75rem",
                              marginBottom: "0.75rem",
                            }}
                          >
                            <div>
                              <p
                                className="nhsuk-heading-s nhsuk-u-margin-bottom-1"
                                style={{ margin: 0 }}
                              >
                                {patient.age}y &middot; {patient.region}
                              </p>
                              <p
                                className="nhsuk-body nhsuk-u-margin-bottom-0"
                                style={{ fontSize: "0.9375rem" }}
                              >
                                {patient.diagnosis}
                              </p>
                              <p
                                className="nhsuk-u-secondary-text-color nhsuk-u-margin-bottom-0"
                                style={{ fontSize: "0.875rem" }}
                              >
                                Medically fit{" "}
                                {patient.medicallyFitSinceDays} day
                                {patient.medicallyFitSinceDays !== 1
                                  ? "s"
                                  : ""}
                              </p>
                            </div>
                            <span
                              className="nhsuk-tag nhsuk-tag--green"
                              style={{ flexShrink: 0, whiteSpace: "nowrap" }}
                            >
                              {match.score}% match
                            </span>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "0.375rem",
                              marginBottom: "1rem",
                            }}
                          >
                            {needs.careTypes.map((ct) => (
                              <span
                                key={ct}
                                className={`nhsuk-tag ${
                                  careTypes.includes(ct)
                                    ? "nhsuk-tag--green"
                                    : "nhsuk-tag--red"
                                }`}
                              >
                                {CARE_TYPE_LABELS[ct] ?? ct}
                              </span>
                            ))}
                            {patient.preferredLanguage && (
                              <span
                                className={`nhsuk-tag ${
                                  langOk
                                    ? "nhsuk-tag--green"
                                    : "nhsuk-tag--orange"
                                }`}
                              >
                                Lang: {patient.preferredLanguage}
                                {langOk ? " ✓" : " ✗"}
                              </span>
                            )}
                          </div>

                          {alreadyInterested ? (
                            <p
                              className="nhsuk-body nhsuk-u-font-weight-bold nhsuk-u-margin-bottom-0"
                              style={{ color: "#007f3b" }}
                            >
                              ✓ Interest expressed — nurse will confirm
                              referral
                            </p>
                          ) : (
                            <button
                              className="nhsuk-button nhsuk-button--secondary nhsuk-u-margin-bottom-0"
                              onClick={() => expressInterest(patient.id)}
                            >
                              Express interest
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {otherPatients.length > 0 && (
            <details className="nhsuk-details">
              <summary className="nhsuk-details__summary">
                <span className="nhsuk-details__summary-text">
                  Other patients in your area ({otherPatients.length})
                </span>
              </summary>
              <div className="nhsuk-details__text">
                <div className="nhsuk-grid-row">
                  {otherPatients.map(({ patient, match }) => {
                    const needs = extractNeeds(patient);
                    return (
                      <div
                        key={patient.id}
                        className="nhsuk-grid-column-one-half"
                      >
                        <div className="nhsuk-card" style={{ opacity: 0.7 }}>
                          <div className="nhsuk-card__content">
                            <p
                              className="nhsuk-heading-s nhsuk-u-margin-bottom-2"
                              style={{ margin: "0 0 0.5rem" }}
                            >
                              {patient.age}y &middot; {patient.diagnosis}{" "}
                              &middot; {patient.region}
                            </p>
                            <div
                              style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "0.375rem",
                                marginBottom: "0.5rem",
                              }}
                            >
                              {needs.careTypes.map((ct) => (
                                <span
                                  key={ct}
                                  className="nhsuk-tag nhsuk-tag--grey"
                                >
                                  {CARE_TYPE_LABELS[ct] ?? ct}
                                </span>
                              ))}
                            </div>
                            {match.excludedReason && (
                              <span className="nhsuk-tag nhsuk-tag--grey">
                                {match.excludedReason}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </details>
          )}

          {matchingPatients.length === 0 && otherPatients.length === 0 && (
            <div className="nhsuk-inset-text">
              <span className="nhsuk-u-visually-hidden">Information: </span>
              <p className="nhsuk-body">No patients currently awaiting placement.</p>
            </div>
          )}
        </>
      )}

      {/* ── TAB: Referral inbox ──────────────────────────────────────── */}
      {activeTab === "inbox" && (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              flexWrap: "wrap",
              gap: "0.5rem",
              marginBottom: "1.5rem",
            }}
          >
            <h2 className="nhsuk-heading-m nhsuk-u-margin-bottom-0">
              Referral inbox
            </h2>
            {lastUpdated && (
              <span
                className="nhsuk-u-secondary-text-color"
                style={{ fontSize: "0.875rem" }}
              >
                Live · polling every 2s · {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>

          {pendingReferrals.length === 0 && handledReferrals.length === 0 && (
            <div className="nhsuk-inset-text">
              <span className="nhsuk-u-visually-hidden">Information: </span>
              <p className="nhsuk-body nhsuk-u-margin-bottom-0">
                No referrals yet.
              </p>
            </div>
          )}

          {pendingReferrals.length > 0 && (
            <div className="nhsuk-u-margin-bottom-6">
              <h3 className="nhsuk-heading-s nhsuk-u-margin-bottom-3">
                Awaiting response
              </h3>
              {pendingReferrals.map((r) => {
                const patient = PATIENT_MAP[r.patientId];
                return (
                  <div
                    key={r.id}
                    className="nhsuk-card nhsuk-u-margin-bottom-4"
                    style={{ borderLeft: "4px solid #1d70b8" }}
                  >
                    <div className="nhsuk-card__content">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "0.75rem",
                        }}
                      >
                        <span className="nhsuk-tag nhsuk-tag--blue">
                          New referral
                        </span>
                        <span
                          className="nhsuk-u-secondary-text-color"
                          style={{ fontSize: "0.875rem" }}
                        >
                          {new Date(r.sentAt).toLocaleTimeString()}
                        </span>
                      </div>
                      {patient && (
                        <>
                          <p className="nhsuk-heading-s nhsuk-u-margin-bottom-2">
                            Patient, age {patient.age} &middot;{" "}
                            {patient.diagnosis}
                          </p>
                          <p
                            className="nhsuk-body nhsuk-u-secondary-text-color nhsuk-u-margin-bottom-4"
                            style={{ fontSize: "0.9375rem" }}
                          >
                            {patient.summary.slice(0, 160)}&hellip;
                          </p>
                        </>
                      )}
                      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                        <button
                          className="nhsuk-button nhsuk-u-margin-bottom-0"
                          onClick={() => respond(r.id, "accepted")}
                        >
                          Accept
                        </button>
                        <button
                          className="nhsuk-button nhsuk-button--warning nhsuk-u-margin-bottom-0"
                          onClick={() => respond(r.id, "declined")}
                        >
                          Decline — no staff
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {handledReferrals.length > 0 && (
            <>
              <h3 className="nhsuk-heading-s nhsuk-u-margin-bottom-3">
                Handled referrals
              </h3>
              <table className="nhsuk-table">
                <caption className="nhsuk-table__caption nhsuk-u-visually-hidden">
                  Handled referrals
                </caption>
                <thead className="nhsuk-table__head">
                  <tr className="nhsuk-table__row">
                    <th className="nhsuk-table__header" scope="col">
                      Patient
                    </th>
                    <th className="nhsuk-table__header" scope="col">
                      Status
                    </th>
                    <th className="nhsuk-table__header" scope="col">
                      Responded
                    </th>
                    <th className="nhsuk-table__header" scope="col">
                      Note
                    </th>
                  </tr>
                </thead>
                <tbody className="nhsuk-table__body">
                  {handledReferrals.map((r) => {
                    const patient = PATIENT_MAP[r.patientId];
                    const tag = STATUS_TAG[r.status] ?? STATUS_TAG.sent;
                    return (
                      <tr key={r.id} className="nhsuk-table__row">
                        <td className="nhsuk-table__cell">
                          {patient
                            ? `Age ${patient.age} · ${patient.diagnosis}`
                            : r.patientId}
                        </td>
                        <td className="nhsuk-table__cell">
                          <span className={`nhsuk-tag ${tag.cls}`}>
                            {tag.label}
                          </span>
                        </td>
                        <td className="nhsuk-table__cell">
                          {r.respondedAt
                            ? new Date(r.respondedAt).toLocaleTimeString()
                            : "—"}
                        </td>
                        <td className="nhsuk-table__cell">
                          {r.declineReason ?? "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </>
          )}
        </>
      )}
    </>
  );
}
