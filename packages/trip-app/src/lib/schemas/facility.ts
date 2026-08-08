/**
 * src/lib/schemas/facility.ts
 *
 * Isomorphic Zod schemas for facility validation. Pure module (no UI
 * imports) shared by the Hono server routes and the React client, following
 * the same pattern as `trip.ts` / `todo.ts` / `scrap.ts`.
 */

import { z } from "zod";
import { FACILITY_CATEGORY_KEYS } from "@/lib/facilityTypeKeys";

/**
 * Schema for creating a facility.
 */
export const CreateFacilitySchema = z.object({
  category: z.enum(FACILITY_CATEGORY_KEYS),
  name: z.string().min(1),
  address: z.string().nullable().optional(),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  phone: z.string().nullable().optional(),
  businessHours: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
  memo: z.string().nullable().optional(),
});

/**
 * Schema for updating a facility (all fields optional).
 */
export const UpdateFacilitySchema = CreateFacilitySchema.partial();

export type UpdateFacility = z.infer<typeof UpdateFacilitySchema>;

/**
 * Schema for the external facility search query (`?q=...`).
 */
export const FacilitySearchQuerySchema = z.object({
  q: z.string().min(1),
});
