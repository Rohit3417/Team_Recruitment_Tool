"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockResults, mockTopX } from "@/mock/results";

export default function ResultsPage() {
  const [expandedTeam, setExpandedTeam] = useState(null);

  const shortlisted = mockResults.filter((r) => r.status === "SHORTLISTED");
  const waitlisted = mockResults.filter((r) => r.status === "WAITLISTED");
  const ineligible = mockResults.filter((r) => r.status === "INELIGIBLE");

  const getStatusBadge = (status) => {
    switch (status) {
      case "SHORTLISTED":
        return <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">Shortlisted</Badge>;
      case "WAITLISTED":
        return <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400">Waitlisted</Badge>;
      case "INELIGIBLE":
        return <Badge variant="destructive">Ineligible</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getFlagBadge = (flag) => {
    switch (flag) {
      case "OK":
        return <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">OK</Badge>;
      case "MISSING":
        return <Badge variant="secondary">MISSING</Badge>;
      case "INVALID":
        return <Badge variant="destructive">INVALID</Badge>;
      default:
        return <Badge variant="secondary">{flag}</Badge>;
    }
  };

  const renderTeamRow = (result, showRank = true) => (
    <div key={result.team_id} className="border-b last:border-0">
      <div
        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setExpandedTeam(expandedTeam === result.team_id ? null : result.team_id)}
      >
        {showRank && result.rank && (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm shrink-0">
            {result.rank}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold">{result.team_name}</span>
            {getStatusBadge(result.status)}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{result.team_id}</span>
            <span>·</span>
            <span>Score: {result.score.toFixed(1)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {Object.entries(result.flags).slice(0, 4).map(([key, value]) => (
            <span key={key} className="text-xs">
              {getFlagBadge(value)}
            </span>
          ))}
        </div>
        <svg
          className={`h-5 w-5 text-muted-foreground transition-transform ${expandedTeam === result.team_id ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {expandedTeam === result.team_id && (
        <div className="bg-muted/30 px-4 pb-4">
          <div className="rounded-lg border bg-card p-4 mt-2">
            <div className="mb-4">
              <h4 className="text-sm font-semibold mb-2">Score Breakdown</h4>
              <div className="space-y-2">
                {result.breakdown.map((item) => (
                  <div key={item.rule_id} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {item.points.toFixed(1)} / {item.max_points}
                      </span>
                      {item.note && (
                        <span className="text-xs text-amber-600 dark:text-amber-400">
                          {item.note.split(" — ")[0]}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-4 border-t">
              <h4 className="text-sm font-semibold mb-2">Reason</h4>
              <p className="text-sm text-muted-foreground">{result.reason}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Results</h1>
          <p className="mt-2 text-muted-foreground">
            Ranked teams with cutoff at top {mockTopX} and explainable scores.
          </p>
        </div>

        <div className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-500/10">
                    <svg className="h-5 w-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{shortlisted.length}</p>
                    <p className="text-xs text-muted-foreground">Shortlisted</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-amber-500/10">
                    <svg className="h-5 w-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{waitlisted.length}</p>
                    <p className="text-xs text-muted-foreground">Waitlisted</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-destructive/10">
                    <svg className="h-5 w-5 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{ineligible.length}</p>
                    <p className="text-xs text-muted-foreground">Ineligible</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                    <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{mockResults.length}</p>
                    <p className="text-xs text-muted-foreground">Total Teams</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {shortlisted.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Shortlisted Teams</CardTitle>
                    <CardDescription>
                      Top {mockTopX} teams that made the cutoff
                    </CardDescription>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    Cutoff: {shortlisted[shortlisted.length - 1]?.score.toFixed(1)} pts
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {shortlisted.map((result) => renderTeamRow(result))}
              </CardContent>
            </Card>
          )}

          {waitlisted.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Waitlisted Teams</CardTitle>
                <CardDescription>
                  Eligible teams below the cutoff
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {waitlisted.map((result) => renderTeamRow(result))}
              </CardContent>
            </Card>
          )}

          {ineligible.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Ineligible Teams</CardTitle>
                <CardDescription>
                  Teams that did not meet mandatory requirements
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {ineligible.map((result) => renderTeamRow(result, false))}
              </CardContent>
            </Card>
          )}

          <div className="flex items-center justify-between">
            <Link href="/rules">
              <Button variant="outline">Back to Rules</Button>
            </Link>
            <div className="flex gap-3">
              <Button variant="outline">Export Results</Button>
              <Button>Export Config</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
