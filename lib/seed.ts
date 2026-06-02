import type { Patient, Facility } from "./types";

export const PATIENTS: Patient[] = [
  {
    id: "p1",
    name: "Margaret Hughes",
    age: 82,
    region: "North London",
    diagnosis: "Post acute ischaemic stroke",
    therapies: ["salt"],
    medicallyFitSinceDays: 9,
    preferredLanguage: "Spanish",
    summary:
      "82-year-old recovering well following an acute ischaemic stroke, now medically fit for discharge. Requires a two-person transfer with hoist due to left-sided hemiplegia. Has dysphagia requiring ongoing SALT (speech and language therapy) input. Experiences nocturnal confusion and needs dementia-aware night nursing. Lives in Barnet, North London.",
  },
  {
    id: "p2",
    name: "Derek Cole",
    age: 74,
    region: "South London",
    diagnosis: "Post hip fracture (ORIF)",
    therapies: [],
    medicallyFitSinceDays: 3,
    summary:
      "74-year-old recovering after hip fracture surgery. Needs short-term general rehabilitation and single-person assistance. No cognitive concerns. Lives in Lambeth, South London.",
  },
];

export const FACILITIES: Facility[] = [
  {
    id: "f1",
    name: "Elmwood Court",
    region: "North London",
    careTypes: ["dementia", "hoist", "salt", "night-nursing"],
    bedsAvailable: 2,
    starRating: 4.8,
    avgResponseMins: 12,
    languages: ["English", "Spanish"],
  },
  {
    id: "f2",
    name: "Rosebank Care Home",
    region: "North London",
    careTypes: ["hoist", "night-nursing"],
    bedsAvailable: 1,
    starRating: 3.1,
    avgResponseMins: 95,
    languages: ["English"],
  },
  {
    id: "f3",
    name: "Oakfield Rehab Centre",
    region: "South London",
    careTypes: ["general-rehab"],
    bedsAvailable: 3,
    starRating: 4.2,
    avgResponseMins: 20,
    languages: ["English", "Polish"],
  },
];
