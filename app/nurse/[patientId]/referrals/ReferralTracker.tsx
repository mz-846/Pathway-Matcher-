"use client";

import { useEffect, useState, useCallback } from "react";
import type { Referral, Interest } from "@/lib/types";
import { FACILITIES } from "@/lib/seed";

const FACILITY_MAP = Object.fromEntries(FACILITIES.map((f) => [f.id, f]));

const STATUS_TAG: Record<string, { label: string; cls: string }> = {
  sent: { label: "Sent", cls: "nhsuk-tag--blue" },
  accepted: { label: "Accepted", cls: "nhsuk-tag--green" },
  declined: { label: "Declined", cls: "nhsuk-tag--red" },
};

function ConfirmReferralButton({
  patientId,
  facilityId,
}: {
  patientId: string;
  facilityId: string;
}) {
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);

  async function confirm() {
    setSending(true);
    await fetch("/api/referrals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientId, facilityId }),
    });
    setSending(false);
    setDone(true);
  }

  if (done) {
    return (
      <span className="nhsuk-tag nhsuk-tag--green">Referral confirmed</span>
    );
  }
  return (
    <button
      className="nhsuk-button"
      onClick={confirm}
      disabled={sending}
      style={{ marginBottom: 0, fontSize: "0.875rem", padding: "0.4rem 0.875rem" }}
    >
      {sending ? "Sending…" : "Confirm referral →"}
    </button>
  );
}

export default function ReferralTracker({ patientId }: { patientId: string }) {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const poll = useCallback(async () => {
    const [refRes, intRes] = await Promise.all([
      fetch(`/api/referrals?patientId=${patientId}`, { cache: "no-store" }),
      fetch(`/api/interests?patientId=${patientId}`, { cache: "no-store" }),
    ]);
    if (refRes.ok) setReferrals(await refRes.json());
    if (intRes.ok) setInterests(await intRes.json());
    setLastUpdated(new Date());
  }, [patientId]);

  useEffect(() => {
    poll();
    const id = setInterval(poll, 2000);
    return () => clearInterval(id);
  }, [poll]);

  const hasActivity = referrals.length > 0 || interests.length > 0;

  return (
    <>
      {lastUpdated && (
        <p
          className="nhsuk-body nhsuk-u-secondary-text-color"
          style={{ fontSize: "0.875rem", marginBottom: "1.25rem" }}
        >
          Live — polling every 2s &middot; last updated:{" "}
          {lastUpdated.toLocaleTimeString()}
        </p>
      )}

      {/* ── Inbound interest panel ── */}
      {interests.length > 0 && (
        <section style={{ marginBottom: "2rem" }}>
          <h2 className="nhsuk-heading-m">
            Inbound interest from care homes
          </h2>
          <div
            style={{
              backgroundColor: "#fff4e5",
              border: "1px solid #ffb81c",
              borderLeft: "4px solid #ffb81c",
              borderRadius: "4px",
              padding: "0.625rem 1rem",
              marginBottom: "0.75rem",
              fontSize: "0.875rem",
              color: "#594d00",
            }}
          >
            Care homes below have expressed interest in this patient. You can
            review and confirm a referral — the home cannot self-place. Final
            decision stays with you.
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
          >
            {interests.map((i) => {
              const facility = FACILITY_MAP[i.facilityId];
              return (
                <div
                  key={i.id}
                  style={{
                    backgroundColor: "#fff",
                    border: "1px solid #ffb81c",
                    borderLeft: "4px solid #ffb81c",
                    borderRadius: "4px",
                    padding: "0.875rem 1.125rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "0.75rem",
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontWeight: "bold",
                        margin: 0,
                        fontSize: "1rem",
                        color: "#212b32",
                      }}
                    >
                      {facility?.name ?? i.facilityId}
                    </p>
                    <p
                      style={{
                        margin: "0.2rem 0 0",
                        fontSize: "0.8125rem",
                        color: "#4c6272",
                      }}
                    >
                      Expressed interest at{" "}
                      {new Date(i.expressedAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <ConfirmReferralButton
                    patientId={patientId}
                    facilityId={i.facilityId}
                  />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Sent referrals ── */}
      <h2 className="nhsuk-heading-m">Sent referrals</h2>

      {!hasActivity && (
        <div className="nhsuk-inset-text">
          <span className="nhsuk-u-visually-hidden">Information: </span>
          <p className="nhsuk-body">
            No referrals sent yet.{" "}
            <a href={`/nurse/${patientId}/results`} className="nhsuk-link">
              Find a placement
            </a>{" "}
            to send a referral.
          </p>
        </div>
      )}

      {referrals.length > 0 && (
        <table className="nhsuk-table">
          <caption className="nhsuk-table__caption nhsuk-u-visually-hidden">
            Referrals for this patient
          </caption>
          <thead className="nhsuk-table__head">
            <tr className="nhsuk-table__row">
              <th className="nhsuk-table__header" scope="col">
                Facility
              </th>
              <th className="nhsuk-table__header" scope="col">
                Status
              </th>
              <th className="nhsuk-table__header" scope="col">
                Sent
              </th>
              <th className="nhsuk-table__header" scope="col">
                Response
              </th>
              <th className="nhsuk-table__header" scope="col">
                Note
              </th>
            </tr>
          </thead>
          <tbody className="nhsuk-table__body">
            {referrals.map((r) => {
              const facility = FACILITY_MAP[r.facilityId];
              const tag = STATUS_TAG[r.status] ?? STATUS_TAG.sent;
              return (
                <tr key={r.id} className="nhsuk-table__row">
                  <td className="nhsuk-table__cell">
                    {facility?.name ?? r.facilityId}
                  </td>
                  <td className="nhsuk-table__cell">
                    <span className={`nhsuk-tag ${tag.cls}`}>{tag.label}</span>
                  </td>
                  <td className="nhsuk-table__cell">
                    {new Date(r.sentAt).toLocaleTimeString()}
                  </td>
                  <td className="nhsuk-table__cell">
                    {r.responseMins != null ? `${r.responseMins} min` : "—"}
                  </td>
                  <td className="nhsuk-table__cell">
                    {r.declineReason ?? "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </>
  );
}
