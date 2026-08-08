/**
 * src/server/env.ts
 *
 * Cloudflare Workers environment bindings type definition.
 * Defines the structure of bindings available in the Cloudflare Pages/Workers context.
 */

import type { D1Database, Fetcher } from "@cloudflare/workers-types";

export interface Env {
  DB: D1Database;
  R2?: R2Bucket;
  ASSETS?: Fetcher;
  AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  YAHOO_CLIENT_ID?: string;
  RESEND_API_KEY: string;
  EMAIL_FROM: string;
}

/**
 * R2 Bucket interface
 * Represents Cloudflare R2 bindings for object storage
 */
export interface R2Bucket {
  put(
    key: string,
    value: ReadableStream | ArrayBuffer | string,
    options?: R2PutOptions
  ): Promise<R2Object>;
  get(key: string): Promise<R2Object | null>;
  delete(key: string): Promise<void>;
  list(options?: R2ListOptions): Promise<R2ObjectList>;
}

export interface R2Object {
  key: string;
  version: string;
  size: number;
  etag: string;
  uploaded: Date;
  httpMetadata?: {
    contentType?: string;
    contentLanguage?: string;
    contentDisposition?: string;
    contentEncoding?: string;
    cacheControl?: string;
    expires?: Date;
  };
  customMetadata?: Record<string, string>;
  range?: { offset: number; length: number };
  body?: ReadableStream<Uint8Array>;
}

export interface R2ObjectList {
  objects: Array<{
    key: string;
    size: number;
    etag: string;
    uploaded: Date;
  }>;
  truncated: boolean;
  cursor?: string;
  delimitedPrefixes?: string[];
}

export interface R2PutOptions {
  customMetadata?: Record<string, string>;
  httpMetadata?: {
    contentType?: string;
    contentLanguage?: string;
    contentDisposition?: string;
    contentEncoding?: string;
    cacheControl?: string;
    expires?: Date;
  };
}

export interface R2ListOptions {
  prefix?: string;
  delimiter?: string;
  cursor?: string;
  limit?: number;
}
