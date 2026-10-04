import { mockTeams } from '../mock/teams';

/**
 * Maps a flag value ("OK" | "MISSING" | "INVALID") to the correct
 * badge modifier class and renders the badge with its text label.
 * Color is never used alone — the text label is always present.
 */
function FlagBadge({ status }) {
  if (!status) {
    return <span className="badge badge--missing">UNVERIFIED</span>;
  }
  const modifierMap = {
    OK: 'badge--ok',
    MISSING: 'badge--missing',
    INVALID: 'badge--invalid',
  };
  const modifier = modifierMap[status] ?? 'badge--missing';
  return <span className={`badge ${modifier}`}>{status}</span>;
}

/**
 * Demo-only upload area. Does not handle real files.
 * Styled with existing CSS variables, no real drag-drop events.
 */
function UploadArea() {
  return (
    <div className="card">
      <h2 className="section-heading">Step 1 — Load Team Data</h2>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-body)', marginBottom: 'var(--space-md)' }}>
        Upload a CSV or JSON export from Google Forms or your registration platform.
        Column mapping happens on the next screen.
      </p>
      {/* Demo upload zone — file input disabled, visual only */}
      <div
        style={{
          border: '2px dashed var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-xl)',
          textAlign: 'center',
          color: 'var(--color-text-secondary)',
          fontSize: 'var(--font-size-body)',
          backgroundColor: 'var(--color-bg)',
          marginBottom: 'var(--space-md)',
        }}
        aria-label="Upload area (demo only)"
      >
        <p style={{ marginBottom: 'var(--space-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)' }}>
          Drag and drop your CSV or JSON file here
        </p>
        <p style={{ fontSize: 'var(--font-size-small)', marginBottom: 'var(--space-md)' }}>
          Accepted formats: .csv, .json
        </p>
        <button className="button button--secondary" type="button" disabled aria-disabled="true">
          Browse file (demo — not active yet)
        </button>
      </div>
      <p style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-text-secondary)' }}>
        Showing mock preview below. Real file parsing is not yet implemented.
      </p>
    </div>
  );
}

/**
 * Preview row for one team. Renders team-level flag aggregates as badges.
 * Long values (names, IDs) are constrained to avoid breaking layout.
 */
function TeamRow({ team }) {
  const size = team.members.length;
  const sizeLabel = size === 1 ? '1 member (solo)' : `${size} members`;

  return (
    <tr>
      <td>
        <span
          style={{ display: 'block', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          title={team.team_name}
        >
          {team.team_name}
        </span>
        <span style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-text-secondary)' }}>
          {team.team_id}
        </span>
      </td>
      <td style={{ whiteSpace: 'nowrap' }}>{sizeLabel}</td>
      <td><FlagBadge status={team.flags.resume} /></td>
      <td><FlagBadge status={team.flags.github} /></td>
      <td><FlagBadge status={team.flags.linkedin} /></td>
      <td><FlagBadge status={team.flags.portfolio} /></td>
    </tr>
  );
}

export default function Load() {
  const totalTeams = mockTeams.length;
  const totalMembers = mockTeams.reduce((sum, t) => sum + t.members.length, 0);

  return (
    <div>
      <h1 className="page-heading">Load Team Data</h1>

      <UploadArea />

      {/* Preview section */}
      <div style={{ marginTop: 'var(--space-xl)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
          <h2 className="section-heading" style={{ marginBottom: 0 }}>
            Data Preview
          </h2>
          <span style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-text-secondary)' }}>
            {totalTeams} teams · {totalMembers} members total (mock data)
          </span>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Team Name</th>
                <th>Team Size</th>
                <th>Resume</th>
                <th>GitHub</th>
                <th>LinkedIn</th>
                <th>Portfolio</th>
              </tr>
            </thead>
            <tbody>
              {mockTeams.map((team) => (
                <TeamRow key={team.team_id} team={team} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
