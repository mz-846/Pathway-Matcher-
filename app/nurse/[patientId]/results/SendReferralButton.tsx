"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SendReferralButton({
  patientId,
  facilityId,
}: {
  patientId: string;
  facilityId: string;
}) {
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSend() {
    setSending(true);
    await fetch("/api/referrals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientId, facilityId }),
    });
    setSending(false);
    setSent(true);
    router.prefetch(`/nurse/${patientId}/referrals`);
  }

  if (sent) {
    return (
      <span className="nhsuk-tag nhsuk-tag--green">Referral sent</span>
    );
  }

  return (
    <button
      onClick={handleSend}
      disabled={sending}
      className="nhsuk-button"
      style={{ marginBottom: 0 }}
    >
      {sending ? "Sending…" : "Send referral"}
    </button>
  );
}
