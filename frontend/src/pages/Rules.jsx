import { mockScoringRules, mockEligibilityRules } from '../mock/rules';

/**
 * Human-readable label for each rule type.
 * Keeps the UI informative without hardcoding any scoring logic.
 */
const TYPE_LABELS = {
  range:   'Range',
  present: 'Present',
  keyword: 'Keyword match',
  count:   'Count',
};

/**
 * Renders a small horizontal fill bar showing weight as a proportion of 1.0.
 * Uses var(--color-accent) for the fill and var(--color-bg) for the track.
 * NOTE: This uses inline styles with existing CSS variables only — no new
 * color values introduced. Flag for potential extraction to .weight-bar /
 * .weight-bar__fill in App.css if this pattern repeats on other pages.
 */
function WeightBar({ weight }) {
  const percent = Math.round(weight * 100);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-sm)',
      }}
    >
      {/* Track */}
      <div
        style={{
          flexGrow: 1,
          height: '8px',
          borderRadius: '9999px',
          backgroundColor: 'var(--color-bg)',
          border: '1px solid var(--color-border)',
          overflow: 'hidden',
        }}
        aria-hidden="true"
      >
        {/* Fill */}
        <div
          style={{
            height: '100%',
            width: `${percent}%`,
            backgroundColor: 'var(--color-accent)',
            borderRadius: '9999px',
          }}
        />
      </div>
      {/* Numeric label — always visible, not hover-only */}
      <span
        style={{
          fontSize: 'var(--font-size-small)',
          color: 'var(--color-text-secondary)',
          minWidth: '36px',
          textAlign: 'right',
          flexShrink: 0,
        }}
      >
        {weight.toFixed(2)}
      </span>
    </div>
  );
}

/**
 * Renders params as small secondary text below the rule row.
 * Handles all param shapes (range/keyword/count/present).
 * Returns null for empty params objects.
 */
function ParamsDetail({ type, params }) {
  if (!params || Object.keys(params).length === 0) return null;

  let text = '';
  if (type === 'range' && params.min != null && params.max != null) {
    text = `Range: ${params.min} – ${params.max}`;
  } else if (type === 'keyword' && Array.isArray(params.keywords)) {
    text = `Keywords: ${params.keywords.join(', ')}`;
  } else if (type === 'count' && params.threshold != null) {
    text = `Threshold: ≥ ${params.threshold}`;
  }

  if (!text) return null;

  return (
    <span
      style={{
        display: 'block',
        marginTop: '2px',
        fontSize: 'var(--font-size-small)',
        color: 'var(--color-text-secondary)',
      }}
    >
      {text}
    </span>
  );
}

/** Scoring Rules section — read-only table. */
function ScoringRulesCard() {
  return (
    <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
      <h2 className="section-heading">Scoring Rules</h2>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-body)', marginBottom: 'var(--space-md)' }}>
        Each rule contributes a weighted score to a team's total. Weights must sum to 1.0.
        Rules and weights are configurable — this view is read-only for now.
      </p>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Field</th>
              <th>Type</th>
              <th>Weight</th>
            </tr>
          </thead>
          <tbody>
            {mockScoringRules.map((rule) => (
              <tr key={rule.id}>
                <td>
                  <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                    {rule.field}
                  </span>
                  <ParamsDetail type={rule.type} params={rule.params} />
                </td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  {TYPE_LABELS[rule.type] ?? rule.type}
                </td>
                <td style={{ minWidth: '180px' }}>
                  <WeightBar weight={rule.weight} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Weight total — useful for organizer sanity-check */}
      <p style={{ marginTop: 'var(--space-sm)', fontSize: 'var(--font-size-small)', color: 'var(--color-text-secondary)', textAlign: 'right' }}>
        Total weight:{' '}
        <strong style={{ color: 'var(--color-text-primary)' }}>
          {mockScoringRules.reduce((sum, r) => sum + r.weight, 0).toFixed(2)}
        </strong>
      </p>
    </div>
  );
}

/** Eligibility Rules section — read-only table. */
function EligibilityRulesCard() {
  return (
    <div className="card">
      <h2 className="section-heading">Eligibility Rules</h2>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-body)', marginBottom: 'var(--space-md)' }}>
        Teams that fail any eligibility rule are marked ineligible and excluded from
        the shortlist, regardless of their score.
      </p>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Field</th>
              <th>Condition</th>
            </tr>
          </thead>
          <tbody>
            {mockEligibilityRules.map((rule) => (
              <tr key={rule.id}>
                <td>{rule.label}</td>
                <td style={{ whiteSpace: 'nowrap', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-small)' }}>
                  {rule.field}
                </td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  {rule.operator}
                  {rule.value != null ? ` ${rule.value}` : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Rules() {
  return (
    <div>
      <h1 className="page-heading">Rules &amp; Config</h1>
      <ScoringRulesCard />
      <EligibilityRulesCard />
    </div>
  );
}
