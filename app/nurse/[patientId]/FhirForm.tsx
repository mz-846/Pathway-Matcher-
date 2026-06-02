"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Patient } from "@/lib/types";
import { extractNeeds } from "@/lib/match";

type FillSource = "fhir" | "image";

interface FormState {
  diagnosis: string;
  region: Patient["region"];
  summary: string;
  careTypes: string[];
  preferredLanguage: string;
  fillSource: FillSource;
}

const CARE_TYPE_GROUPS: {
  heading: string;
  options: { value: string; label: string }[];
}[] = [
  {
    heading: "Mobility & transfer",
    options: [
      { value: "hoist", label: "Hoist / two-person transfer" },
      { value: "general-rehab", label: "General rehabilitation" },
    ],
  },
  {
    heading: "Therapies",
    options: [{ value: "salt", label: "SALT — speech & language therapy" }],
  },
  {
    heading: "Cognitive & night-care",
    options: [
      { value: "dementia", label: "Dementia / cognitive care" },
      { value: "night-nursing", label: "Night nursing" },
    ],
  },
];

const LANGUAGE_OPTIONS = [
  "",
  "English",
  "Spanish",
  "Polish",
  "Bengali",
  "Urdu",
  "Punjabi",
  "Somali",
];

function seedState(patient: Patient, source: FillSource = "fhir"): FormState {
  return {
    diagnosis: patient.diagnosis,
    region: patient.region,
    summary: patient.summary,
    careTypes: extractNeeds(patient).careTypes,
    preferredLanguage: patient.preferredLanguage ?? "",
    fillSource: source,
  };
}

export default function FhirForm({ patient }: { patient: Patient }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<FormState>(() => seedState(patient));
  const [repulled, setRepulled] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);

  const rePull = useCallback(() => {
    setState(seedState(patient, "fhir"));
    setImagePreview(null);
    setRepulled(true);
    setTimeout(() => setRepulled(false), 2000);
  }, [patient]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImagePreview(url);
    setExtracting(true);
    // Simulate OCR delay, then fill from seed (deterministic demo stand-in)
    setTimeout(() => {
      setState(seedState(patient, "image"));
      setExtracting(false);
    }, 900);
  }

  function toggleCareType(ct: string) {
    setState((prev) => ({
      ...prev,
      careTypes: prev.careTypes.includes(ct)
        ? prev.careTypes.filter((x) => x !== ct)
        : [...prev.careTypes, ct],
    }));
  }

  function findPlacement() {
    const params = new URLSearchParams({
      summary: state.summary,
      careTypes: state.careTypes.join(","),
      region: state.region,
      diagnosis: state.diagnosis,
      preferredLanguage: state.preferredLanguage,
    });
    router.push(`/nurse/${patient.id}/results?${params.toString()}`);
  }

  const isImage = state.fillSource === "image";

  return (
    <div style={{ marginTop: "1.5rem" }}>
      {/* ── Input source row ─────────────────────────────────────────── */}
      <div className="nhsuk-grid-row" style={{ marginBottom: "1.5rem" }}>
        {/* Path 1: FHIR */}
        <div className="nhsuk-grid-column-one-half">
          <div
            style={{
              border: `2px solid ${!isImage ? "#007f3b" : "#aeb7bd"}`,
              borderRadius: "4px",
              padding: "1rem",
              height: "100%",
              backgroundColor: !isImage ? "#e8f4e8" : "#fff",
            }}
          >
            <div style={{ display: "flex", gap: "0.625rem", alignItems: "flex-start" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  backgroundColor: !isImage ? "#007f3b" : "#aeb7bd",
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: "0.875rem",
                  flexShrink: 0,
                  marginTop: "0.1rem",
                }}
              >
                ✓
              </span>
              <div>
                <p style={{ fontWeight: "bold", color: !isImage ? "#007f3b" : "#212b32", margin: 0, fontSize: "0.9375rem" }}>
                  {!isImage ? "Auto-filled from Electronic Patient Record via FHIR" : "FHIR auto-fill available"}
                </p>
                <p style={{ color: "#425563", margin: "0.25rem 0 0.625rem", fontSize: "0.8125rem" }}>
                  Pulled from [EPR] — no manual entry required.
                </p>
                <button
                  className="nhsuk-button nhsuk-button--secondary"
                  onClick={rePull}
                  style={{ marginBottom: 0, fontSize: "0.875rem" }}
                >
                  {repulled ? "✓ Re-pulled" : "Re-pull from EPR"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Path 2: Image upload */}
        <div className="nhsuk-grid-column-one-half">
          <div
            style={{
              border: `2px solid ${isImage ? "#007f3b" : "#aeb7bd"}`,
              borderRadius: "4px",
              padding: "1rem",
              height: "100%",
              backgroundColor: isImage ? "#e8f4e8" : "#fff",
            }}
          >
            {isImage && imagePreview && (
              <div style={{ display: "flex", gap: "0.625rem", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    backgroundColor: "#007f3b",
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: "0.875rem",
                    flexShrink: 0,
                  }}
                >
                  ✓
                </span>
                <div>
                  <p style={{ fontWeight: "bold", color: "#007f3b", margin: 0, fontSize: "0.9375rem" }}>
                    Extracted from uploaded record image
                  </p>
                  <p style={{ color: "#425563", margin: "0.2rem 0 0", fontSize: "0.8125rem" }}>
                    Simulated for demo — in production this uses on-device OCR.
                  </p>
                </div>
              </div>
            )}

            {imagePreview && (
              <img
                src={imagePreview}
                alt="Uploaded record preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: 120,
                  objectFit: "contain",
                  borderRadius: "4px",
                  border: "1px solid #d8dde0",
                  marginBottom: "0.75rem",
                  display: "block",
                }}
              />
            )}

            {extracting && (
              <p style={{ color: "#005eb8", fontWeight: "bold", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                Extracting from image…
              </p>
            )}

            <p style={{ fontWeight: "bold", margin: "0 0 0.375rem", fontSize: "0.9375rem" }}>
              No EPR access? Upload a record image
            </p>
            <p style={{ color: "#4c6272", fontSize: "0.8125rem", margin: "0 0 0.625rem" }}>
              Photo or scan of paper discharge notes (.jpg, .jpeg, .png)
            </p>

            <div className="nhsuk-form-group" style={{ marginBottom: 0 }}>
              <input
                ref={fileInputRef}
                className="nhsuk-file-upload"
                id="record-image"
                name="record-image"
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={handleImageChange}
              />
            </div>
          </div>
        </div>
      </div>

      <h2 className="nhsuk-heading-m">Discharge requirements</h2>

      {/* Diagnosis */}
      <div className="nhsuk-form-group">
        <label className="nhsuk-label nhsuk-u-font-weight-bold" htmlFor="fhir-diagnosis">
          Diagnosis
        </label>
        <input
          className="nhsuk-input"
          id="fhir-diagnosis"
          type="text"
          value={state.diagnosis}
          onChange={(e) => setState((p) => ({ ...p, diagnosis: e.target.value }))}
        />
      </div>

      {/* Region */}
      <div className="nhsuk-form-group">
        <label className="nhsuk-label nhsuk-u-font-weight-bold" htmlFor="fhir-region">
          District / Region
        </label>
        <select
          className="nhsuk-select"
          id="fhir-region"
          value={state.region}
          onChange={(e) =>
            setState((p) => ({ ...p, region: e.target.value as Patient["region"] }))
          }
        >
          <option value="North London">North London</option>
          <option value="South London">South London</option>
        </select>
      </div>

      {/* Care type checkboxes */}
      {CARE_TYPE_GROUPS.map(({ heading, options }) => (
        <div className="nhsuk-form-group" key={heading}>
          <fieldset className="nhsuk-fieldset">
            <legend className="nhsuk-fieldset__legend nhsuk-fieldset__legend--s">
              <h3 className="nhsuk-fieldset__heading" style={{ fontSize: "1rem" }}>
                {heading}
              </h3>
            </legend>
            <div className="nhsuk-checkboxes nhsuk-checkboxes--small">
              {options.map(({ value, label }) => (
                <div className="nhsuk-checkboxes__item" key={value}>
                  <input
                    className="nhsuk-checkboxes__input"
                    id={`fhir-ct-${value}`}
                    type="checkbox"
                    checked={state.careTypes.includes(value)}
                    onChange={() => toggleCareType(value)}
                  />
                  <label
                    className="nhsuk-label nhsuk-checkboxes__label"
                    htmlFor={`fhir-ct-${value}`}
                  >
                    {label}
                  </label>
                </div>
              ))}
            </div>
          </fieldset>
        </div>
      ))}

      {/* Preferred language */}
      <div className="nhsuk-form-group">
        <label className="nhsuk-label nhsuk-u-font-weight-bold" htmlFor="fhir-lang">
          Preferred language for care
          <span className="nhsuk-hint" style={{ display: "block", fontWeight: "normal", marginTop: "0.25rem" }}>
            Language the patient is most comfortable communicating in.
          </span>
        </label>
        <select
          className="nhsuk-select"
          id="fhir-lang"
          value={state.preferredLanguage}
          onChange={(e) => setState((p) => ({ ...p, preferredLanguage: e.target.value }))}
        >
          {LANGUAGE_OPTIONS.map((lang) => (
            <option key={lang} value={lang}>
              {lang === "" ? "— No preference / not specified —" : lang}
            </option>
          ))}
        </select>
      </div>

      {/* Discharge summary */}
      <div className="nhsuk-form-group">
        <label className="nhsuk-label nhsuk-u-font-weight-bold" htmlFor="fhir-summary">
          Discharge summary
          <span
            className="nhsuk-hint"
            style={{ display: "block", fontWeight: "normal", marginTop: "0.25rem" }}
          >
            Keywords in this text supplement the checkboxes above to drive matching.
          </span>
        </label>
        <textarea
          className="nhsuk-textarea"
          id="fhir-summary"
          rows={5}
          value={state.summary}
          onChange={(e) => setState((p) => ({ ...p, summary: e.target.value }))}
        />
      </div>

      {/* Action buttons */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",
          alignItems: "center",
          marginTop: "0.5rem",
        }}
      >
        <button
          className="nhsuk-button"
          onClick={findPlacement}
          style={{ marginBottom: 0 }}
        >
          Find placement
        </button>
        <button
          className="nhsuk-button nhsuk-button--secondary"
          onClick={rePull}
          style={{ marginBottom: 0 }}
        >
          {repulled ? "✓ Re-pulled" : "Re-pull from EPR"}
        </button>
      </div>
    </div>
  );
}
