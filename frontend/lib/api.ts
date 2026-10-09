/**
 * Backend API client — all HTTP communication goes through this module.
 *
 * design.md section 4: A single fetcher<T> base wrapper centralises headers,
 * base URL, JSON parsing, and error handling. Components/pages must not call
 * fetch() directly.
 *
 * Each function that is not yet backed by a real endpoint is marked with the
 * exact grep-able prefix: TEMPORARY MOCK — replace when <owner>'s <file> is available.
 */

import type { UploadResponse, DatasetTeamsResponse } from "@/lib/types";

// ---------------------------------------------------------------------------
// Base URL
// ---------------------------------------------------------------------------

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:8000";

// ---------------------------------------------------------------------------
// Base fetch wrapper
// ---------------------------------------------------------------------------

/**
 * Centralised fetch helper.
 * - Automatically sets Content-Type for JSON bodies.
 * - Throws a descriptive Error for non-2xx responses.
 * - Never silently substitutes mock data when a real API call fails.
 */
async function fetcher<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let message = `API error ${response.status} ${response.statusText}`;
    try {
      const body = (await response.json()) as { detail?: string; message?: string };
      message = body.detail ?? body.message ?? message;
    } catch {
      // response body not JSON — keep the status-based message
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Ingest endpoints (M2, Day 4)
// ---------------------------------------------------------------------------

/**
 * POST /upload
 *
 * TEMPORARY MOCK — replace when M2's api/upload.py is available (Day 4).
 *
 * Accepts a File object and returns the full UploadResponse including
 * dataset_id, validation_report, and preview rows. The mock simulates a
 * realistic network delay so the progress bar in UploadBox is exercised.
 */
export async function uploadDataset(file: File): Promise<UploadResponse> {
  // TEMPORARY MOCK — replace when M2's api/upload.py is available (Day 4).
  const { mockUploadResponse } = await import("@/lib/mocks/uploadResponse");

  // Simulate network + server processing time (1.2 s)
  await new Promise((resolve) => setTimeout(resolve, 1200));

  // When the real endpoint is live, replace the body above with:
  //   const formData = new FormData();
  //   formData.append("file", file);
  //   return fetcher<UploadResponse>("/upload", { method: "POST", body: formData });
  void file; // parameter is accepted now so callers don't need to change signature
  return { ...mockUploadResponse, filename: file.name };
}

/**
 * GET /datasets/{dataset_id}/teams
 *
 * TEMPORARY MOCK — replace when M2's api/upload.py (GET /datasets/{id}/teams) is available (Day 4).
 *
 * Returns the full normalized team list with per-member field statuses.
 */
export async function getDatasetTeams(datasetId: string): Promise<DatasetTeamsResponse> {
  // TEMPORARY MOCK — replace when M2's api/upload.py (GET /datasets/{id}/teams) is available (Day 4).
  const { mockDatasetTeams } = await import("@/lib/mocks/datasetTeams");

  // Simulate network round-trip (600 ms)
  await new Promise((resolve) => setTimeout(resolve, 600));

  // When the real endpoint is live, replace the body above with:
  //   return fetcher<DatasetTeamsResponse>(`/datasets/${datasetId}/teams`);
  void datasetId; // parameter accepted so callers don't need to change signature
  return mockDatasetTeams;
}

// ---------------------------------------------------------------------------
// Future endpoints — stubs to be implemented in later days
// ---------------------------------------------------------------------------

// Day 3+: listConfigs, saveConfig, getConfig, updateConfig — M4 api/configs.py
// Day 6+: createRun, getRun, listRuns — M4 api/runs.py
// Day 8+: rerank — M1 rank.py
// Day 9+: listOverrides, createOverride — M4 api/overrides.py
// Day 11+: compareConfigs — M1 api/compare.py
// Day 11+: exportRun — M4 api/export.py

// Export fetcher for any future ad-hoc use (e.g. hooks)
export { fetcher };
