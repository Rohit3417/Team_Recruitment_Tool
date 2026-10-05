export const scoringConfig = {
  topX: 4,
  aggregationMethod: "mean", // how a team's score combines multiple
    // members' values. Options: "mean" | "sum-with-cap" | "top-k"
  missingDataPolicy: "penalty", // Options: "penalty" | "neutral" |
    // "redistribute". This mock uses "penalty": missing fields are
    // scored as 0 of their max, explicitly labeled as such.
};

export const mockScoringRules = [
  {
    id: "rule_github_contribs",
    field: "github_contributions",
    type: "range",
    weight: 0.35,
    params: { min: 0, max: 100 }
  },
  {
    id: "rule_resume_skills",
    field: "resume_skills",
    type: "keyword",
    weight: 0.25,
    params: { keywords: ["react", "node", "python", "docker", "cloud"] }
  },
  {
    id: "rule_portfolio_quality",
    field: "portfolio_url",
    type: "present",
    weight: 0.20,
    params: {}
  },
  {
    id: "rule_linkedin_verification",
    field: "linkedin_url",
    type: "present",
    weight: 0.10,
    params: {}
  },
  {
    id: "rule_team_experience_count",
    field: "past_hackathon_count",
    type: "count",
    weight: 0.10,
    params: { threshold: 2 }
  }
];

export const mockEligibilityRules = [
  {
    id: "elig_github_required",
    field: "github_url",
    operator: "present",
    value: null,
    label: "Must have at least one valid GitHub profile in the team"
  },
  {
    id: "elig_resume_required",
    field: "resume_url",
    operator: "present",
    value: null,
    label: "Must submit a readable resume link"
  }
];
