/**
 * src/api/unwrap.ts
 *
 * Shared response unwrapping for the Hono RPC client wrappers. Every API
 * function follows the same "throw on !res.ok, otherwise parse JSON"
 * contract — this keeps that logic (and its typing) in one place.
 *
 * Endpoints with bespoke status handling (invite join's non-fatal 409,
 * facility search's 503 message) intentionally keep hand-rolled checks.
 */

import type { ClientResponse } from "hono/client";

/** Distributes over a response union to pull out each variant's JSON body. */
type JsonBody<R> = R extends { json(): Promise<infer T> } ? T : never;

/**
 * The JSON body type of a response's non-error variants. Excluding `ok: false`
 * (instead of extracting `ok: true`) keeps handlers that call `c.json(x)`
 * without an explicit status — Hono types those as `ContentfulStatusCode`,
 * whose `ok` is `boolean`.
 */
type SuccessJson<R> = JsonBody<Exclude<R, { ok: false }>>;

/**
 * Throw `errorMessage` on a non-2xx response, otherwise return the parsed
 * JSON body typed as the endpoint's success shape.
 */
export async function unwrap<R extends ClientResponse<unknown>>(
  res: R,
  errorMessage: string
): Promise<SuccessJson<R>> {
  if (!res.ok) {
    throw new Error(errorMessage);
  }
  return (await res.json()) as SuccessJson<R>;
}

/**
 * Like {@link unwrap}, but peels the `{ data: ... }` envelope that list
 * endpoints return, so query hooks get the payload without casting.
 */
export async function unwrapData<R extends ClientResponse<unknown>>(
  res: R,
  errorMessage: string
): Promise<SuccessJson<R> extends { data: infer D } ? D : never> {
  const body = await unwrap(res, errorMessage);
  return (body as { data: SuccessJson<R> extends { data: infer D } ? D : never }).data;
}
