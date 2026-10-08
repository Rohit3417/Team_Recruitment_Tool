# Scoring Design & Engine Logic

## 1. Default Criteria (0-100 Points Each)
The system evaluates five core areas. Every criterion must yield a normalized score between 0 and 100.
1. **Technical Skills:** Matched via keyword extraction.
2. **Projects & Experience:** Based on project counts, complexity, and years of experience.
3. **GitHub Activity:** Based on 12-month commit volume, repo count, and active languages.
4. **Achievements:** Hackathon wins, publications, and certifications.
5. **Portfolio:** Reachability and content presence.

## 2. Scoring Mathematics
* **Member Score:** `Sum(Criterion Score × Criterion Weight)`
* **Team Score:** `Mean(Member Scores)` computed before any team-level modifiers are applied.

## 3. Separation of Concerns
**Eligibility is strictly separate from scoring.** A team may have a perfect score of 100 but still be marked `Ineligible` or `Needs review` if they fail a hard filter (e.g., minimum team size, missing mandatory links). Eligibility rules are evaluated independently of the weight distribution.