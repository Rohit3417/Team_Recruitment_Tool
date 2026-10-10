"use client";

/**
 * /upload — Day 2
 *
 * prd.md section 2 /upload Day 2:
 *   "File picker, upload progress indicator, preview table of first 20 rows,
 *    using mock rows until the API exists."
 *
 * Wires:
 *   - UploadBox (drag-drop + click-to-browse, simulated progress)
 *   - DataPreview (preview table + expandable member detail with StatusBadges)
 *   - AppStateContext.setDatasetId — persists dataset_id for /config → /runs flow
 *
 * Day 4 features NOT built here: ValidationPanel, SummaryCards with icons,
 * duplicate team visual flagging beyond warning counts.
 */

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { UploadBox } from "@/components/upload/UploadBox";
import { DataPreview } from "@/components/upload/DataPreview";
import { useAppState } from "@/lib/app-state-context";
import type { UploadResponse } from "@/lib/types";

export default function UploadPage() {
  const { setDatasetId } = useAppState();
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  function handleUploadComplete(response: UploadResponse) {
    // Wire dataset_id into shared app state — required by design.md section 5
    // and prd.md section 4 (carried into /config and used by POST /runs).
    setDatasetId(response.dataset_id);
    setUploadResult(response);
    setUploadError(null);
  }

  function handleUploadError(message: string) {
    setUploadError(message);
    setUploadResult(null);
  }

  return (
    <div className="flex-1 p-6 max-w-4xl mx-auto w-full">
      <div className="flex flex-col gap-6">
        {/* Upload card */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Registration File</CardTitle>
            <CardDescription>
              Accepts CSV (wide format, up to 6 members per team) or JSON. File picker and
              upload preview ship on Day 2. Connection to the real{" "}
              <code className="text-xs bg-muted px-1 py-0.5 rounded">POST /upload</code> API
              and the full validation report arrive on Day 4.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UploadBox
              onUploadComplete={handleUploadComplete}
              onUploadError={handleUploadError}
            />

            {/* Server-side upload error (e.g. wrong format, too large) */}
            {uploadError && (
              <p role="alert" className="mt-3 text-sm text-red-600">
                {uploadError}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Summary line + preview — shown after a successful upload */}
        {uploadResult && (
          <>
            {/* Summary line: total teams, members, error/warning counts */}
            <div className="text-sm text-muted-foreground px-1">
              <span className="font-medium text-foreground">
                {uploadResult.total_teams} teams
              </span>{" "}
              ·{" "}
              <span className="font-medium text-foreground">
                {uploadResult.total_members} members
              </span>{" "}
              ·{" "}
              {uploadResult.validation_report.errors_count > 0 ? (
                <span className="text-red-600 font-medium">
                  {uploadResult.validation_report.errors_count} error
                  {uploadResult.validation_report.errors_count !== 1 ? "s" : ""}
                </span>
              ) : (
                <span className="text-green-700">0 errors</span>
              )}{" "}
              ·{" "}
              {uploadResult.validation_report.warnings_count > 0 ? (
                <span className="text-yellow-700 font-medium">
                  {uploadResult.validation_report.warnings_count} warning
                  {uploadResult.validation_report.warnings_count !== 1 ? "s" : ""}
                </span>
              ) : (
                <span className="text-muted-foreground">0 warnings</span>
              )}
              {" · "}
              <span className="font-mono text-xs text-muted-foreground">
                dataset_id: {uploadResult.dataset_id}
              </span>
            </div>

            {/* Data preview card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Team Preview</CardTitle>
                <CardDescription>
                  First {uploadResult.preview.length} teams from{" "}
                  <span
                    className="font-medium max-w-xs truncate inline-block align-bottom"
                    title={uploadResult.filename}
                  >
                    {uploadResult.filename}
                  </span>
                  . Click &ldquo;Show members&rdquo; to see per-field statuses for each team.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataPreview
                  datasetId={uploadResult.dataset_id}
                  previewRows={uploadResult.preview}
                  validationReport={uploadResult.validation_report}
                />
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
