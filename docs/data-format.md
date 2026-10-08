# Registration Data Format (CSV and JSON)

Owner: M2 | Used by: M1 (tests), M3 (upload preview), M4 (integration tests, API contract)

Organizers upload one file with one record per team. Two formats are accepted. Both are converted into the same internal `Team` / `Member` objects by `backend/app/ingest/loader.py`.

## 1. CSV (wide format, one row per team)

Header columns, in this order:

```
team_id, team_name,
member_1_name, member_1_email, member_1_github, member_1_resume, member_1_linkedin, member_1_portfolio,
member_2_name, member_2_email, ... member_2_portfolio,
... up to member_6_*
```

- Fixed columns: `team_id`, `team_name`.
- Per member (N = 1 to 6): `member_N_name`, `member_N_email`, `member_N_github`, `member_N_resume`, `member_N_linkedin`, `member_N_portfolio`.
- The sample file has 38 columns (2 + 6 members x 6 fields).
- Encoding: UTF-8 (the loader falls back to latin-1 if UTF-8 fails).
- A team with fewer members leaves the unused `member_N_*` columns completely empty.

## 2. JSON (nested format, `members[]` array)

```json
{
  "teams": [
    {
      "team_id": "T001",
      "team_name": "Byte Bandits",
      "members": [
        {
          "name": "Aarav Desai",
          "email": "aarav.desai0@example.com",
          "github": "https://github.com/aaravdesai0",
          "resume": "https://drive.example.com/resumes/aaravdesai0.pdf",
          "linkedin": "https://www.linkedin.com/in/aaravdesai0",
          "portfolio": "https://aaravdesai0.example.dev"
        }
      ]
    }
  ]
}
```

- Top level is either an object with a `teams` array (preferred) or a bare array of teams.
- Team size = length of `members` (no padding needed).
- A member field may be `""`, `null`, or absent. All three mean MISSING.

## 3. Field reference

| Field | Required? | Accepted values | Notes |
|---|---|---|---|
| `team_id` | Yes | Any unique string, e.g. `T001` | If empty, the loader assigns one from the row number and warns. |
| `team_name` | Yes | Text | Leading/trailing spaces are trimmed. |
| `name` | Yes (per member) | Text | Empty name is flagged, the member is kept. |
| `email` | Yes (per member) | `x@y.z` | Compared case-insensitively for duplicates. Invalid format is flagged INVALID. |
| `github` | Optional | Profile URL, repo URL, or plain username | `https://github.com/user`, `https://github.com/user/repo`, `user` all resolve to the username `user`. |
| `resume` | Optional | Public `http(s)` URL to a PDF or a Drive link | Parsed later (Day 5). |
| `linkedin` | Optional | `http(s)` LinkedIn profile URL | Only validated, never fetched. |
| `portfolio` | Optional | `http(s)` URL | Checked later (Day 10). |

## 4. Blank, missing and invalid rules

These follow the project's fairness rule: never invent data, never turn a blank into a zero.

| Situation | Status | Example |
|---|---|---|
| Cell empty / `null` / absent | `MISSING` | `member_1_github` is blank |
| Value present but malformed | `INVALID` | `https://github.com/` (no username), `htp://...`, `not a website`, `aarav.patel.at.example.com` |
| Value well-formed | `OK` (link not yet fetched) | `https://github.com/user` |

Notes:
- Variable team size is handled by counting members that have at least one non-empty field.
- Row numbers in the validation report refer to the CSV data row (header = row 1, first team = row 2) or the JSON array index + 1.
- A missing or invalid link never rejects the team. It is flagged and handled later by the config's `missing_policy`.
- Hard file errors (not CSV/JSON, empty file, no `team_id`/`team_name` column, over the size limit) reject the whole upload with a clear message.

## 5. What the sample files contain (40 teams)

`samples/registrations_40.csv` and `samples/registrations_40.json` hold the same data.

| What | Teams |
|---|---|
| Solo teams (1 member) | T001 to T006 |
| 2-member teams | T007 to T016 (plus T038, T039, T040) |
| 3-member teams | T017 to T030 |
| 4-member teams | T031 to T036 |
| One 6-member team | T037 |
| Missing links (blank) | T002, T003, T004, T008, T012, T018, T022, T024, T031, T037, T040 |
| Invalid values | T005 (GitHub without username), T006 (`htp://` resume), T009 (portfolio), T010 (LinkedIn without id), T014 (email), T019 (GitLab as GitHub), T026 (`resume.pdf` not a URL), T028 (bad username chars), T033 (`http://`) |
| Messy but valid | T015 (extra spaces in team name), T020 (upper-case email) |
| Duplicate team | T038 is a copy of T010 (same name and members) |
| Duplicate member | T039 member 2 has the same name, email and GitHub as T020 member 2 |
| Almost-empty team | T040 (all links blank, one member has no name) |

Regenerate any time with: `python scripts/make_registrations.py`

## 6. Internal objects (output of loader.py, Day 2)

```
Team:   team_id, team_name, members[], source_row
Member: name, email, github, resume, linkedin, portfolio   (each: value + status OK/MISSING/INVALID)
```
