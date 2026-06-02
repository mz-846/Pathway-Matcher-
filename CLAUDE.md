# Pathway Matcher — NHS Discharge Demo

Hackathon demo. All data is **synthetic** — no real patients, no external APIs, no LLM calls.

## Stack
- Next.js 16 (App Router), React 19, TypeScript, Tailwind v4
- nhsuk-frontend 10.x (CSS from `nhsuk-frontend/dist/nhsuk/nhsuk-frontend.min.css`)
- nhsapp-frontend 5.x (care home mobile look, CSS inline)

## Key files
| Path | Purpose |
|---|---|
| `lib/types.ts` | Facility, Patient, Referral, MatchResult types |
| `lib/seed.ts` | 2 patients, 3 facilities (exact synthetic data) |
| `lib/store.ts` | In-memory store on `globalThis` — survives hot-reload |
| `lib/match.ts` | Keyword extraction + deterministic facility ranking |

## API routes
| Method | Path | Purpose |
|---|---|---|
| POST | `/api/match` | `{patientId}` → `{extractedNeeds, rankedMatches}` |
| GET | `/api/facilities` | All facilities |
| POST | `/api/availability` | Update facility beds/careTypes |
| GET | `/api/referrals` | Filter by `?patientId=` or `?facilityId=` |
| POST | `/api/referrals` | Create referral (status: sent) |
| PATCH | `/api/referrals/[id]` | Update status (accepted/declined) |
| POST | `/api/reset` | Re-seed all data |

## Interfaces
- **Nurse** — `/nurse` — NHS.UK desktop design, `nhsuk-` CSS classes
- **Care Home** — `/carehome` — NHS App mobile style, 480px max-width

## Scoring (deterministic)
```
score = matchRatio*70 + 15 + (starRating/5)*10 + (avgResponseMins<=20 ? 5 : 0) - gaps*8
```
Clamped 0–100. Excluded if region differs or bedsAvailable===0.

## Next.js 16 notes
- `params` and `searchParams` are **Promises** — always `await params`
- Route handlers: `export async function GET/POST/PATCH(req, {params})`
