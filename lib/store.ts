import type { Facility, Referral, Interest } from "./types";
import { FACILITIES } from "./seed";

interface Store {
  facilities: Facility[];
  referrals: Referral[];
  interests: Interest[];
}

declare global {
  // eslint-disable-next-line no-var
  var __pathwayStore: Store | undefined;
}

function createStore(): Store {
  return {
    facilities: FACILITIES.map((f) => ({ ...f })),
    referrals: [],
    interests: [],
  };
}

function getStore(): Store {
  if (!globalThis.__pathwayStore) {
    globalThis.__pathwayStore = createStore();
  }
  return globalThis.__pathwayStore;
}

export function reset(): void {
  globalThis.__pathwayStore = createStore();
}

export function getFacilities(): Facility[] {
  return getStore().facilities;
}

export function getFacility(id: string): Facility | undefined {
  return getStore().facilities.find((f) => f.id === id);
}

export function updateFacility(
  id: string,
  patch: Partial<Pick<Facility, "bedsAvailable" | "careTypes">>
): Facility | undefined {
  const store = getStore();
  const idx = store.facilities.findIndex((f) => f.id === id);
  if (idx === -1) return undefined;
  store.facilities[idx] = { ...store.facilities[idx], ...patch };
  return store.facilities[idx];
}

export function getReferrals(): Referral[] {
  return getStore().referrals;
}

export function addReferral(referral: Referral): void {
  getStore().referrals.push(referral);
}

export function updateReferral(
  id: string,
  patch: Partial<Referral>
): Referral | undefined {
  const store = getStore();
  const idx = store.referrals.findIndex((r) => r.id === id);
  if (idx === -1) return undefined;
  store.referrals[idx] = { ...store.referrals[idx], ...patch };
  return store.referrals[idx];
}

export function getInterests(): Interest[] {
  return getStore().interests;
}

export function addInterest(interest: Interest): void {
  getStore().interests.push(interest);
}
