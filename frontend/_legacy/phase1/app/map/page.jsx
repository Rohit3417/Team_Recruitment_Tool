"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockColumns } from "@/mock/columns";

const fieldOptions = [
  { value: "team_name", label: "Team Name" },
  { value: "member_name", label: "Member Name" },
  { value: "github_url", label: "GitHub URL" },
  { value: "resume_url", label: "Resume URL" },
  { value: "linkedin_url", label: "LinkedIn URL" },
  { value: "portfolio_url", label: "Portfolio URL" },
  { value: "ignore", label: "Ignore this column" },
];

export default function MapPage() {
  const [mappings, setMappings] = useState(
    mockColumns.reduce((acc, col) => {
      acc[col.raw_header] = col.suggested_field;
      return acc;
    }, {})
  );

  const handleMappingChange = (header, value) => {
    setMappings((prev) => ({ ...prev, [header]: value }));
  };

  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case "high":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
      case "low":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
      default:
        return "bg-muted";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Map Columns</h1>
          <p className="mt-2 text-muted-foreground">
            Map your spreadsheet columns to the fields the tool understands.
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Column Mapping</CardTitle>
                  <CardDescription>
                    Review and adjust the automatic field suggestions
                  </CardDescription>
                </div>
                <Badge variant="outline">{mockColumns.length} columns detected</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockColumns.map((column, index) => (
                  <div
                    key={column.raw_header}
                    className="flex items-center gap-4 rounded-lg border p-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium truncate">{column.raw_header}</span>
                        <Badge className={getConfidenceColor(column.confidence)} variant="secondary">
                          {column.confidence}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Column {index + 1} of {mockColumns.length}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      <Select
                        value={mappings[column.raw_header]}
                        onValueChange={(value) => handleMappingChange(column.raw_header, value)}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fieldOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mapping Summary</CardTitle>
              <CardDescription>
                Overview of how your columns map to system fields
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {fieldOptions
                  .filter((opt) => opt.value !== "ignore")
                  .map((field) => {
                    const count = Object.values(mappings).filter((m) => m === field.value).length;
                    return (
                      <div key={field.value} className="flex items-center justify-between rounded-lg border p-3">
                        <span className="text-sm font-medium">{field.label}</span>
                        <Badge variant={count > 0 ? "default" : "secondary"}>{count}</Badge>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <Link href="/load">
              <Button variant="outline">Back to Upload</Button>
            </Link>
            <Link href="/rules">
              <Button>Continue to Rules</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
