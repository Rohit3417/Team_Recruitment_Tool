import { scoringConfig } from './rules';

export const mockTopX = scoringConfig.topX;
export { scoringConfig };

export const mockResults = [
  {
    team_id: "T005",
    team_name: "MegaByte Squad",
    score: 92.4,
    rank: 1,
    eligible: true,
    status: "SHORTLISTED",
    flags: { resume: "OK", github: "OK", linkedin: "OK", portfolio: "OK" },
    breakdown: [
      { rule_id: "rule_github_contribs", label: "GitHub contributions", points: 34, max_points: 35, note: null },
      { rule_id: "rule_resume_skills", label: "Resume skill match", points: 24, max_points: 25, note: null },
      { rule_id: "rule_portfolio_quality", label: "Portfolio presence", points: 20, max_points: 20, note: null },
      { rule_id: "rule_linkedin_verification", label: "LinkedIn verification", points: 10, max_points: 10, note: null },
      { rule_id: "rule_team_experience_count", label: "Hackathon experience", points: 4.4, max_points: 10, note: null }
    ],
    reason: "Shortlisted — ranked #1 of 5 eligible teams, 24.4 points above cutoff. Strong portfolio & contributions across all 5 members."
  },
  {
    team_id: "T002",
    team_name: "Solo Hacker",
    score: 84.0,
    rank: 2,
    eligible: true,
    status: "SHORTLISTED",
    flags: { resume: "OK", github: "OK", linkedin: "OK", portfolio: "OK" },
    breakdown: [
      { rule_id: "rule_github_contribs", label: "GitHub contributions", points: 30, max_points: 35, note: null },
      { rule_id: "rule_resume_skills", label: "Resume skill match", points: 22, max_points: 25, note: null },
      { rule_id: "rule_portfolio_quality", label: "Portfolio presence", points: 20, max_points: 20, note: null },
      { rule_id: "rule_linkedin_verification", label: "LinkedIn verification", points: 10, max_points: 10, note: null },
      { rule_id: "rule_team_experience_count", label: "Hackathon experience", points: 2, max_points: 10, note: null }
    ],
    reason: "Shortlisted — ranked #2 of 5 eligible teams, 16.0 points above cutoff. Complete solo profile with live portfolio."
  },
  {
    team_id: "T006",
    team_name: "Code Crafters",
    score: 79.5,
    rank: 3,
    eligible: true,
    status: "SHORTLISTED",
    flags: { resume: "OK", github: "OK", linkedin: "OK", portfolio: "OK" },
    breakdown: [
      { rule_id: "rule_github_contribs", label: "GitHub contributions", points: 27, max_points: 35, note: null },
      { rule_id: "rule_resume_skills", label: "Resume skill match", points: 20, max_points: 25, note: null },
      { rule_id: "rule_portfolio_quality", label: "Portfolio presence", points: 20, max_points: 20, note: null },
      { rule_id: "rule_linkedin_verification", label: "LinkedIn verification", points: 10, max_points: 10, note: null },
      { rule_id: "rule_team_experience_count", label: "Hackathon experience", points: 2.5, max_points: 10, note: null }
    ],
    reason: "Shortlisted — ranked #3 of 5 eligible teams, 11.5 points above cutoff. Well-rounded 3-person team."
  },
  {
    team_id: "T001",
    team_name: "Byte Me",
    score: 68.0,
    rank: 4,
    eligible: true,
    status: "SHORTLISTED",
    flags: { resume: "OK", github: "OK", linkedin: "MISSING", portfolio: "MISSING" },
    breakdown: [
      { rule_id: "rule_github_contribs", label: "GitHub contributions", points: 28, max_points: 35, note: null },
      { rule_id: "rule_resume_skills", label: "Resume skill match", points: 22, max_points: 25, note: null },
      { rule_id: "rule_portfolio_quality", label: "Portfolio presence", points: 0, max_points: 20, note: "MISSING — penalty policy applied, scored 0 of 20" },
      { rule_id: "rule_linkedin_verification", label: "LinkedIn verification", points: 10, max_points: 10, note: null },
      { rule_id: "rule_team_experience_count", label: "Hackathon experience", points: 8, max_points: 10, note: null }
    ],
    reason: "Shortlisted — ranked #4 of 5 eligible teams, at cutoff line. Strong GitHub scores despite missing portfolio."
  },
  {
    team_id: "T007",
    team_name: "Syntax Terror",
    score: 58.0,
    rank: 5,
    eligible: true,
    status: "WAITLISTED",
    flags: { resume: "OK", github: "OK", linkedin: "OK", portfolio: "MISSING" },
    breakdown: [
      { rule_id: "rule_github_contribs", label: "GitHub contributions", points: 22, max_points: 35, note: null },
      { rule_id: "rule_resume_skills", label: "Resume skill match", points: 16, max_points: 25, note: null },
      { rule_id: "rule_portfolio_quality", label: "Portfolio presence", points: 0, max_points: 20, note: "MISSING — penalty policy applied, scored 0 of 20" },
      { rule_id: "rule_linkedin_verification", label: "LinkedIn verification", points: 10, max_points: 10, note: null },
      { rule_id: "rule_team_experience_count", label: "Hackathon experience", points: 10, max_points: 10, note: null }
    ],
    reason: "Waitlisted — ranked #5 of 5 eligible teams, 10.0 points below cutoff. Missing portfolio."
  },
  {
    team_id: "T008",
    team_name: "Stack Overflow",
    score: 87.0,
    rank: null,
    eligible: false,
    status: "INELIGIBLE",
    flags: { resume: "OK", github: "MISSING", linkedin: "OK", portfolio: "OK" },
    breakdown: [
      { rule_id: "rule_github_contribs", label: "GitHub contributions", points: 24, max_points: 35, note: "Repository activity evaluated, but team lacks valid member GitHub profile URL" },
      { rule_id: "rule_resume_skills", label: "Resume skill match", points: 24, max_points: 25, note: null },
      { rule_id: "rule_portfolio_quality", label: "Portfolio presence", points: 19, max_points: 20, note: null },
      { rule_id: "rule_linkedin_verification", label: "LinkedIn verification", points: 10, max_points: 10, note: null },
      { rule_id: "rule_team_experience_count", label: "Hackathon experience", points: 10, max_points: 10, note: null }
    ],
    reason: "Ineligible — failed eligibility rule: 'Must have at least one valid GitHub profile in the team'. High score of 87.0 excluded from ranking due to missing mandatory GitHub profile."
  },
  {
    team_id: "T003",
    team_name: "Null Pointers",
    score: 30.0,
    rank: null,
    eligible: false,
    status: "INELIGIBLE",
    flags: { resume: "INVALID", github: "OK", linkedin: "MISSING", portfolio: "MISSING" },
    breakdown: [
      { rule_id: "rule_github_contribs", label: "GitHub contributions", points: 20, max_points: 35, note: null },
      { rule_id: "rule_resume_skills", label: "Resume skill match", points: 0, max_points: 25, note: "INVALID — unreadable resume URL" },
      { rule_id: "rule_portfolio_quality", label: "Portfolio presence", points: 0, max_points: 20, note: "MISSING — penalty policy applied, scored 0 of 20" },
      { rule_id: "rule_linkedin_verification", label: "LinkedIn verification", points: 0, max_points: 10, note: "MISSING — penalty policy applied, scored 0 of 10" },
      { rule_id: "rule_team_experience_count", label: "Hackathon experience", points: 10, max_points: 10, note: null }
    ],
    reason: "Ineligible — failed eligibility rule: 'Must submit a readable resume link'. Resume link is INVALID."
  },
  {
    team_id: "T004",
    team_name: "Kernel Panic",
    score: 0.0,
    rank: null,
    eligible: false,
    status: "INELIGIBLE",
    flags: { resume: "MISSING", github: "MISSING", linkedin: "MISSING", portfolio: "MISSING" },
    breakdown: [
      { rule_id: "rule_github_contribs", label: "GitHub contributions", points: 0, max_points: 35, note: "MISSING — penalty policy applied, scored 0 of 35 (failed eligibility)" },
      { rule_id: "rule_resume_skills", label: "Resume skill match", points: 0, max_points: 25, note: "MISSING — penalty policy applied, scored 0 of 25 (failed eligibility)" },
      { rule_id: "rule_portfolio_quality", label: "Portfolio presence", points: 0, max_points: 20, note: "MISSING — penalty policy applied, scored 0 of 20" },
      { rule_id: "rule_linkedin_verification", label: "LinkedIn verification", points: 0, max_points: 10, note: "MISSING — penalty policy applied, scored 0 of 10" },
      { rule_id: "rule_team_experience_count", label: "Hackathon experience", points: 0, max_points: 10, note: null }
    ],
    reason: "Ineligible — failed eligibility rules: missing both GitHub and Resume links."
  }
];
