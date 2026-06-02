import type { Patient, Facility, MatchResult } from "./types";

const KW_MAP: [string, string][] = [
  ["dementia", "dementia"],
  ["confusion", "dementia"],
  ["cognitive", "dementia"],
  ["hoist", "hoist"],
  ["two-person", "hoist"],
  ["2-person", "hoist"],
  ["transfer", "hoist"],
  ["swallow", "salt"],
  ["dysphagia", "salt"],
  ["salt", "salt"],
  ["speech", "salt"],
  ["night", "night-nursing"],
  ["rehab", "general-rehab"],
  ["rehabilitation", "general-rehab"],
];

export function extractNeeds(patient: Patient): {
  careTypes: string[];
  region: string;
} {
  const lower = (patient.summary ?? "").toLowerCase();
  const fromSummary = KW_MAP.filter(([kw]) => lower.includes(kw)).map(
    ([, ct]) => ct
  );
  const all = [...fromSummary, ...(patient.therapies ?? [])];
  return { careTypes: [...new Set(all)], region: patient.region };
}

// Self-check (Margaret, preferredLanguage="Spanish"):
//   Elmwood  → score 100, fit "full"  (all 4 care types + Spanish spoken)
//   Rosebank → score ~32, fit "partial" (gaps: dementia, salt, No Spanish-speaking carers)
//   Oakfield → excluded "Outside district"
export function rankFacilities(
  patient: Patient,
  facilities: Facility[]
): MatchResult[] {
  const needs = extractNeeds(patient);
  const preferredLang = patient.preferredLanguage;

  const results: MatchResult[] = facilities.map((facility) => {
    if (facility.region !== needs.region) {
      return {
        facilityId: facility.id,
        score: 0,
        matchReasons: [],
        gaps: [...needs.careTypes],
        excluded: true,
        excludedReason: "Outside district",
        fit: "none",
      };
    }

    if (facility.bedsAvailable === 0) {
      return {
        facilityId: facility.id,
        score: 0,
        matchReasons: [],
        gaps: [...needs.careTypes],
        excluded: true,
        excludedReason: "No beds today",
        fit: "none",
      };
    }

    const fct = facility.careTypes as string[];
    const matched = needs.careTypes.filter((ct) => fct.includes(ct));
    const careGaps = needs.careTypes.filter((ct) => !fct.includes(ct));

    const matchReasons: string[] = [];
    if (matched.length > 0) {
      matchReasons.push(`Provides: ${matched.join(", ")}`);
    }
    matchReasons.push(
      `${facility.bedsAvailable} bed${facility.bedsAvailable !== 1 ? "s" : ""} available`
    );
    matchReasons.push(`${facility.starRating}★ rated`);
    if (facility.avgResponseMins <= 20) {
      matchReasons.push(`Fast response (avg ${facility.avgResponseMins} min)`);
    }

    // Language scoring — soft gap, not a hard exclusion
    let langBonus = 0;
    const langGaps: string[] = [];
    if (preferredLang) {
      const langs = facility.languages ?? [];
      if (langs.includes(preferredLang)) {
        langBonus = 5;
        matchReasons.push(`Carers speak ${preferredLang}`);
      } else {
        langBonus = -8;
        langGaps.push(`No ${preferredLang}-speaking carers`);
      }
    }

    const needsCount = needs.careTypes.length;
    const matchRatio = needsCount > 0 ? matched.length / needsCount : 1;

    const raw =
      matchRatio * 70 +
      15 +
      (facility.starRating / 5) * 10 +
      (facility.avgResponseMins <= 20 ? 5 : 0) -
      careGaps.length * 8 +
      langBonus;

    const score = Math.round(Math.min(100, Math.max(0, raw)) * 10) / 10;
    const allGaps = [...careGaps, ...langGaps];
    const fit: "full" | "partial" = allGaps.length === 0 ? "full" : "partial";

    return {
      facilityId: facility.id,
      score,
      matchReasons,
      gaps: allGaps,
      excluded: false,
      fit,
    };
  });

  return results.sort((a, b) => b.score - a.score);
}
