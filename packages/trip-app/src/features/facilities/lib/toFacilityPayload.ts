/**
 * src/features/facilities/lib/toFacilityPayload.ts
 *
 * Maps facility form values onto the create/update API payload shape.
 * Shared by useFacilitySection.ts and useFacilityDetailEdit.ts.
 */

import type { FacilityFormValues } from "../components/FacilityForm";

export function toFacilityPayload(values: FacilityFormValues) {
  return {
    category: values.category,
    name: values.name,
    address: values.address || null,
    lat: values.lat,
    lng: values.lng,
    phone: values.phone || null,
    businessHours: values.businessHours || null,
    url: values.url || null,
    memo: values.memo || null,
  };
}
