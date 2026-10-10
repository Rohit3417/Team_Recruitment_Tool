"use client";

/**
 * /config — Day 3
 *
 * prd.md section 2 /config Day 3:
 *   "Full configuration UI in local state only: add, remove, and reorder
 *    criteria; weight sliders and number inputs with a live total that must
 *    equal 100 before saving is allowed; top-X input; aggregation method
 *    dropdown; missing-data policy dropdown."
 *
 * Day 3 is LOCAL STATE ONLY. No endpoint is called. Saving a configuration is
 * wired to M4's POST /configs on Day 5; the "Run evaluation" button arrives Day 7.
 *
 * Field names match backend/app/scoring/config_schema.py exactly:
 *   criteria[].name, criteria[].weight, criteria[].keywords,
 *   eligibility_rules, top_x, aggregation, missing_policy, tie_break.
 *
 * The frontend performs NO scoring/eligibility/ranking. It only collects and
 * displays configuration values (agent.md section 5).
 */

import { useId, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CriteriaList } from "@/components/config/CriteriaList";
import { WeightControls } from "@/components/config/WeightControls";
import type {
  AggregationMethod,
  Criterion,
  CriterionWithId,
  MissingPolicy,
  ScoringConfiguration,
} from "@/lib/types";

const AGGREGATION_ITEMS: Record<string, string> = {
  mean: "Mean (average of member scores)",
  weighted_mean: "Weighted mean",
  at_least_one: "At least one member",
};

const MISSING_POLICY_ITEMS: Record<string, string> = {
  redistribute: "Redistribute (renormalize across available criteria)",
  neutral: "Neutral (missing contributes nothing)",
  penalty: "Penalty (missing reduces the score)",
};

export default function ConfigurePage() {
  const nameId = useId();
  const topXId = useId();
  const aggregationId = useId();
  const missingPolicyId = useId();

  // Day 3 starts from a single blank criterion with a stable React rendering key.
  const [configName, setConfigName] = useState("");
  const [criteria, setCriteria] = useState<CriterionWithId[]>(() => [
    { id: crypto.randomUUID(), name: "", weight: 0, keywords: [] },
  ]);
  const [topX, setTopX] = useState(10);
  const [aggregation, setAggregation] = useState<AggregationMethod>("mean");
  const [missingPolicy, setMissingPolicy] =
    useState<MissingPolicy>("redistribute");
  const [savedConfig, setSavedConfig] = useState<ScoringConfiguration | null>(
    null
  );

  const totalWeights = criteria.reduce((sum, c) => sum + c.weight, 0);
  const hasValidCriteriaCount = criteria.length >= 1;
  const allNamesNonEmpty = criteria.every((c) => c.name.trim() !== "");
  const hasValidTotalWeights = totalWeights === 100;
  const canSave = hasValidCriteriaCount && allNamesNonEmpty && hasValidTotalWeights;

  // tie_break must terminate with "team_id" (config_schema.py + api-contract.md).
  const tieBreak = useMemo(() => {
    const names = criteria.map((c) => c.name.trim()).filter((n) => n !== "");
    return [...names, "team_id"];
  }, [criteria]);

  function handleTopXChange(raw: string) {
    if (raw.trim() === "") {
      setTopX(1);
      return;
    }
    const value = Number(raw);
    if (!Number.isFinite(value)) {
      return;
    }
    setTopX(Math.max(1, Math.round(value)));
  }

  function handleSave() {
    if (!canSave) {
      return;
    }
    // Clean backend payload: only name, weight, keywords (no UI id field leaking)
    const backendCriteria: Criterion[] = criteria.map(({ name, weight, keywords }) => ({
      name: name.trim(),
      weight,
      keywords,
    }));

    const config: ScoringConfiguration = {
      name: configName.trim() === "" ? "Untitled configuration" : configName.trim(),
      is_preset: false,
      config_json: {
        criteria: backendCriteria,
        eligibility_rules: [],
        top_x: topX,
        aggregation,
        missing_policy: missingPolicy,
        tie_break: tieBreak,
      },
    };
    // Local only on Day 3. POST /configs wiring arrives Day 5.
    console.log("Saved configuration:", config);
    setSavedConfig(config);
  }

  return (
    <div className="flex-1 p-6 max-w-4xl mx-auto w-full">
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold tracking-tight">Configure</h1>
          <p className="text-sm text-muted-foreground">
            Set criteria, weights, and selection policies. Weights must sum to
            100 before the configuration can be saved.
          </p>
        </header>

        {/* Configuration identity */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>
              A name for this scoring strategy. Saving and presets connect to the
              backend on Day 5.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-1.5">
            <label htmlFor={nameId} className="text-sm font-medium">
              Configuration name
            </label>
            <Input
              id={nameId}
              value={configName}
              onChange={(e) => setConfigName(e.target.value)}
              placeholder="e.g. Balanced Hackathon Default"
              className="max-w-sm"
            />
          </CardContent>
        </Card>

        {/* Criteria */}
        <Card>
          <CardHeader>
            <CardTitle>Criteria</CardTitle>
            <CardDescription>
              Add, edit, reorder, or remove criteria. Each criterion is scored
              0–100 by the backend and combined using the weights below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CriteriaList criteria={criteria} onChange={setCriteria} />
          </CardContent>
        </Card>

        {/* Weights */}
        <Card>
          <CardHeader>
            <CardTitle>Weights</CardTitle>
            <CardDescription>
              Enter a numeric weight (0–100) per criterion. The total must equal
              100.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WeightControls criteria={criteria} onChange={setCriteria} />
          </CardContent>
        </Card>

        {/* Selection and policies */}
        <Card>
          <CardHeader>
            <CardTitle>Selection &amp; data policy</CardTitle>
            <CardDescription>
              How many teams to shortlist and how missing data is handled.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor={topXId} className="text-sm font-medium">
                Top X (number of teams to shortlist)
              </label>
              <Input
                id={topXId}
                type="number"
                min={1}
                step={1}
                inputMode="numeric"
                value={topX}
                onChange={(e) => handleTopXChange(e.target.value)}
                className="w-28 text-right tabular-nums"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor={aggregationId} className="text-sm font-medium">
                Aggregation method
              </label>
              <Select
                items={AGGREGATION_ITEMS}
                value={aggregation}
                onValueChange={(value) => {
                  if (typeof value === "string") {
                    setAggregation(value as AggregationMethod);
                  }
                }}
              >
                <SelectTrigger id={aggregationId} className="w-full max-w-sm">
                  <SelectValue placeholder="Select aggregation method" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(AGGREGATION_ITEMS) as AggregationMethod[]).map(
                    (value) => (
                      <SelectItem key={value} value={value}>
                        {AGGREGATION_ITEMS[value]}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor={missingPolicyId} className="text-sm font-medium">
                Missing-data policy
              </label>
              <Select
                items={MISSING_POLICY_ITEMS}
                value={missingPolicy}
                onValueChange={(value) => {
                  if (typeof value === "string") {
                    setMissingPolicy(value as MissingPolicy);
                  }
                }}
              >
                <SelectTrigger id={missingPolicyId} className="w-full max-w-sm">
                  <SelectValue placeholder="Select missing-data policy" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(MISSING_POLICY_ITEMS) as MissingPolicy[]).map(
                    (value) => (
                      <SelectItem key={value} value={value}>
                        {MISSING_POLICY_ITEMS[value]}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Tie-break order</span>
              <p className="text-xs text-muted-foreground">
                Derived from the criteria order and always terminates with{" "}
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                  team_id
                </code>{" "}
                for deterministic ranking.
              </p>
              <p className="font-mono text-xs text-foreground" title={tieBreak.join(" → ")}>
                {tieBreak.join(" → ")}
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Eligibility rules</span>
              <p className="text-xs text-muted-foreground">
                Hard pass/fail rules (e.g. minimum team size, mandatory links)
                are evaluated separately from scoring. No rules added — the
                eligibility-rule editor is not part of Day 3.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Save */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Button type="button" disabled={!canSave} onClick={handleSave}>
              Save configuration
            </Button>
            {!canSave && (
              <span className="text-sm text-muted-foreground">
                {criteria.length === 0
                  ? "Add at least one criterion to save."
                  : !allNamesNonEmpty
                  ? "Every criterion must have a name."
                  : `Weights must sum to 100 (currently ${totalWeights}).`}
              </span>
            )}
          </div>

          {savedConfig && (
            <div
              role="status"
              className="flex flex-col gap-2 rounded-lg border border-border bg-muted/30 p-4"
            >
              <p className="text-sm text-foreground">
                Saved locally as{" "}
                <span className="font-medium">{savedConfig.name}</span>. Backend
                persistence (POST /configs) arrives Day 5.
              </p>
              <pre className="overflow-x-auto rounded bg-background p-3 text-xs">
                {JSON.stringify(savedConfig, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
