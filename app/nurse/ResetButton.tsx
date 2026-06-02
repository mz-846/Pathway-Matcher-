"use client";

import { useRouter } from "next/navigation";

export default function ResetButton() {
  const router = useRouter();

  async function handleReset() {
    await fetch("/api/reset", { method: "POST" });
    router.push("/nurse");
    router.refresh();
  }

  return (
    <button
      onClick={handleReset}
      className="nhsuk-button nhsuk-button--secondary"
      style={{ marginBottom: 0, fontSize: "0.875rem", padding: "0.3rem 0.75rem" }}
    >
      Reset demo
    </button>
  );
}
