"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { mockScoringRules, mockEligibilityRules, scoringConfig } from "@/mock/rules";

export default function RulesPage() {
  const getTypeLabel = (type) => {
    const labels = {
      range: "Range Score",
      present: "Presence Check",
      keyword: "Keyword Match",
      count: "Count Threshold",
    };
    return labels[type] || type;
  };

  const getWeightPercentage = (weight) => {
    return `${Math.round(weight * 100)}%`;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Scoring Rules</h1>
          <p className="mt-2 text-muted-foreground">
            Review the scoring rules, eligibility criteria, and configuration settings.
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>
                Global settings for team selection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                      <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium">Top X Teams</span>
                  </div>
                  <p className="text-2xl font-bold">{scoringConfig.topX}</p>
                  <p className="text-xs text-muted-foreground mt-1">Teams to shortlist</p>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                      <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium">Aggregation</span>
                  </div>
                  <p className="text-lg font-semibold capitalize">{scoringConfig.aggregationMethod}</p>
                  <p className="text-xs text-muted-foreground mt-1">Member score combination</p>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                      <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium">Missing Data</span>
                  </div>
                  <p className="text-lg font-semibold capitalize">{scoringConfig.missingDataPolicy}</p>
                  <p className="text-xs text-muted-foreground mt-1">Policy for missing fields</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Scoring Rules</CardTitle>
                  <CardDescription>
                    Criteria used to evaluate and score teams
                  </CardDescription>
                </div>
                <Badge variant="outline">{mockScoringRules.length} rules</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockScoringRules.map((rule, index) => (
                  <div key={rule.id}>
                    {index > 0 && <Separator className="mb-4" />}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{rule.field.replace(/_/g, " ")}</span>
                          <Badge variant="secondary" className="text-xs">
                            {getTypeLabel(rule.type)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          ID: {rule.id}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{getWeightPercentage(rule.weight)}</p>
                        <p className="text-xs text-muted-foreground">Weight</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Eligibility Rules</CardTitle>
                  <CardDescription>
                    Mandatory requirements teams must meet to be considered
                  </CardDescription>
                </div>
                <Badge variant="outline">{mockEligibilityRules.length} requirements</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockEligibilityRules.map((rule) => (
                  <div key={rule.id} className="flex items-start gap-3 rounded-lg border p-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive/10 shrink-0 mt-0.5">
                      <svg className="h-3 w-3 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{rule.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Field: {rule.field} · Operator: {rule.operator}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <Link href="/map">
              <Button variant="outline">Back to Mapping</Button>
            </Link>
            <Link href="/results">
              <Button>View Results</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
