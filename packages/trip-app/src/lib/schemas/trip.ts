/**
 * src/lib/schemas/trip.ts
 *
 * Zod schemas for trip-related data validation.
 * Isomorphic schemas used by both server and client.
 */

import { z } from "zod";

const INVALID_DATE_MSG = "Invalid date format, expected YYYY-MM-DD";

/**
 * Schema for creating a new trip
 */
export const CreateTripSchema = z
  .object({
    title: z.string().min(1, "Title is required").max(100, "Title must be 100 characters or less"),
    description: z.string().max(500, "Description must be 500 characters or less").optional(),
    startDate: z.iso.date(INVALID_DATE_MSG),
    endDate: z.iso.date(INVALID_DATE_MSG),
    location: z.string().max(200, "Location must be 200 characters or less").optional(),
  })
  .refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
    message: "End date must be on or after start date",
    path: ["endDate"],
  });

export type CreateTrip = z.infer<typeof CreateTripSchema>;

/**
 * Schema for updating an existing trip
 */
export const UpdateTripSchema = z.object({
  id: z.string().min(1, "Trip ID is required"),
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be 100 characters or less")
    .optional(),
  description: z.string().max(500, "Description must be 500 characters or less").optional(),
  startDate: z.iso.date(INVALID_DATE_MSG).optional(),
  endDate: z.iso.date(INVALID_DATE_MSG).optional(),
  location: z.string().max(200, "Location must be 200 characters or less").optional(),
});

export type UpdateTrip = z.infer<typeof UpdateTripSchema>;

/**
 * Schema for trip query parameters (pagination, sorting)
 */
export const TripQueryParamsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(["createdAt", "updatedAt", "startDate", "title"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type TripQueryParams = z.infer<typeof TripQueryParamsSchema>;
