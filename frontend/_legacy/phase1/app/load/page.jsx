"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockTeams } from "@/mock/teams";

export default function LoadPage() {
  const [uploaded] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Load Teams</h1>
          <p className="mt-2 text-muted-foreground">
            Upload your team registration data to begin the shortlisting process.
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Data</CardTitle>
              <CardDescription>
                Upload CSV or JSON file exported from your registration form
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 px-6 py-12">
                <svg
                  className="mx-auto h-12 w-12 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <div className="mt-4 text-center">
                  <p className="text-sm font-medium text-foreground">
                    Drag and drop your file here
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    or click to browse (CSV, JSON up to 10MB)
                  </p>
                </div>
                <Button variant="outline" className="mt-4">
                  Browse Files
                </Button>
              </div>
            </CardContent>
          </Card>

          {uploaded && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Upload Preview</CardTitle>
                  <CardDescription>
                    {mockTeams.length} teams loaded successfully
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="px-4 py-3 text-left font-medium">Team</th>
                            <th className="px-4 py-3 text-left font-medium">Members</th>
                            <th className="px-4 py-3 text-left font-medium">Profiles</th>
                            <th className="px-4 py-3 text-left font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mockTeams.map((team) => (
                            <tr key={team.team_id} className="border-b last:border-0">
                              <td className="px-4 py-3 font-medium">{team.team_name}</td>
                              <td className="px-4 py-3">{team.members.length} member{team.members.length > 1 ? "s" : ""}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  {Object.entries(team.flags).map(([key, value]) => (
                                    <Badge key={key} variant={value === "OK" ? "default" : "secondary"} className="text-xs">
                                      {key}
                                    </Badge>
                                  ))}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1.5">
                                  {Object.values(team.flags).every(f => f === "OK") ? (
                                    <>
                                      <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                      <span className="text-xs text-muted-foreground">Complete</span>
                                    </>
                                  ) : (
                                    <>
                                      <div className="h-2 w-2 rounded-full bg-amber-500" />
                                      <span className="text-xs text-muted-foreground">Incomplete</span>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center justify-end gap-3">
                <Button variant="outline">Clear Upload</Button>
                <Link href="/map">
                  <Button>Continue to Mapping</Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
