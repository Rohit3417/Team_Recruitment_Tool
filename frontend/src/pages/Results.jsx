import { useState } from 'react';
import { scoringConfig } from '../mock/rules';
import { mockResults } from '../mock/results';

/**
 * Eligible / not-eligible badge.
 * Always includes a text label — never color alone.
 */
function EligibilityBadge({ eligible }) {
  return eligible
    ? <span className="badge badge--ok">Eligible</span>
    : <span className="badge badge--invalid">Not Eligible</span>;
}

/**
 * Summary of only the non-OK flags for a team.
 * Omits OK flags to reduce noise — the Load page already shows the full set.
 * Returns null if there are no flags to display (all flags are OK).
 */
function FlagsSummary({ flags }) {
  const modifierMap = { MISSING: 'badge--missing', INVALID: 'badge--invalid' };
  const nonOkEntries = Object.entries(flags).filter(([, status]) => status !== 'OK');

  if (nonOkEntries.length === 0) return null;

  return (
    <span style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)' }}>
      {nonOkEntries.map(([field, status]) => (
        <span key={field} className={`badge ${modifierMap[status] ?? 'badge--missing'}`}>
          {field}: {status}
        </span>
      ))}
    </span>
  );
}

/**
 * Score breakdown table shown when a row is expanded.
 * Renders all breakdown entries including notes (MISSING / INVALID / policy).
 * Ineligible teams still show their breakdown — never hidden.
 *
 * NOTE: Uses inline styles with existing CSS variables for the breakdown
 * panel background and note text. Flag for potential extraction to a
 * .breakdown-panel class in App.css if this pattern is reused on other pages.
 */
function BreakdownPanel({ breakdown }) {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-bg)',
        borderTop: '1px solid var(--color-border)',
        padding: 'var(--space-sm) var(--space-md)',
      }}
    >
      <table
        className="table"
        style={{ fontSize: 'var(--font-size-small)' }}
        aria-label="Score breakdown"
      >
        <thead>
          <tr>
            <th>Rule</th>
            <th style={{ textAlign: 'right' }}>Points</th>
            <th style={{ textAlign: 'right' }}>Max</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          {breakdown.map((entry) => (
            <tr key={entry.rule_id}>
              <td>{entry.label}</td>
              <td style={{ textAlign: 'right', fontWeight: 'var(--font-weight-semibold)' }}>
                {entry.points}
              </td>
              <td style={{ textAlign: 'right', color: 'var(--color-text-secondary)' }}>
                {entry.max_points}
              </td>
              <td>
                {entry.note
                  ? (
                    <span style={{ color: 'var(--color-danger)', fontSize: 'var(--font-size-small)' }}>
                      {entry.note}
                    </span>
                  )
                  : <span style={{ color: 'var(--color-text-secondary)' }}>—</span>
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * A single result row + its collapsible breakdown.
 * Uses a real <button> with aria-expanded for keyboard + screen-reader support.
 * Rows below the cutoff and ineligible rows are visually de-emphasized via muted text color —
 * still fully visible (never hidden) to support the "explain rejection" requirement.
 */
function ResultRow({ result, isMuted, isExpanded, onToggle, rankDisplay }) {
  const rowTextColor = isMuted
    ? 'var(--color-text-secondary)'
    : 'var(--color-text-primary)';

  const formattedRank = rankDisplay ?? (result.rank != null ? `#${result.rank}` : '—');

  return (
    <>
      <tr style={{ color: rowTextColor }}>
        {/* Rank */}
        <td style={{ fontWeight: 'var(--font-weight-semibold)', whiteSpace: 'nowrap' }}>
          {formattedRank}
        </td>

        {/* Team Name — expandable toggle button */}
        <td>
          <button
            type="button"
            aria-expanded={isExpanded}
            onClick={onToggle}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              fontFamily: 'var(--font-family)',
              fontSize: 'var(--font-size-body)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-accent)',
              textAlign: 'left',
              textDecoration: 'underline',
              textDecorationColor: 'transparent',
            }}
            title={isExpanded ? 'Collapse score breakdown' : 'Expand score breakdown'}
          >
            {result.team_name}
            {/* Visual expand/collapse hint — aria-expanded is the machine-readable state */}
            <span aria-hidden="true" style={{ marginLeft: 'var(--space-xs)', fontSize: 'var(--font-size-small)' }}>
              {isExpanded ? '▲' : '▼'}
            </span>
          </button>
        </td>

        {/* Score */}
        <td style={{ whiteSpace: 'nowrap', fontWeight: 'var(--font-weight-semibold)' }}>
          {result.score.toFixed(1)}
        </td>

        {/* Eligible */}
        <td>
          <EligibilityBadge eligible={result.eligible} />
        </td>

        {/* Non-OK flags only */}
        <td>
          <FlagsSummary flags={result.flags} />
        </td>

        {/* Reason */}
        <td style={{ fontSize: 'var(--font-size-small)', color: rowTextColor, minWidth: '320px', overflowWrap: 'anywhere' }}>
          {result.reason}
        </td>
      </tr>

      {/* Breakdown panel — rendered as a second row spanning all columns */}
      {isExpanded && (
        <tr>
          <td colSpan={6} style={{ padding: 0 }}>
            <BreakdownPanel breakdown={result.breakdown} />
          </td>
        </tr>
      )}
    </>
  );
}

/**
 * Visual cutoff divider row — spans all columns.
 * Uses a distinct background and centered label to make the shortlist
 * boundary immediately obvious.
 */
function CutoffRow({ topX }) {
  return (
    <tr aria-label={`Cutoff line — Top ${topX} shortlisted above`}>
      <td
        colSpan={6}
        style={{
          padding: 'var(--space-xs) var(--space-md)',
          backgroundColor: 'var(--color-bg)',
          borderTop: '2px solid var(--color-accent)',
          borderBottom: '2px solid var(--color-accent)',
          textAlign: 'center',
          fontSize: 'var(--font-size-small)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--color-accent)',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        — Cutoff: Top {topX} shortlisted above this line —
      </td>
    </tr>
  );
}

export default function Results() {
  const [expandedIds, setExpandedIds] = useState(new Set());

  function toggleRow(teamId) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(teamId)) {
        next.delete(teamId);
      } else {
        next.add(teamId);
      }
      return next;
    });
  }

  const topX = scoringConfig.topX;

  // Use status directly to drive grouping:
  // 1. SHORTLISTED and WAITLISTED teams sorted by rank ascending
  const rankedTeams = mockResults
    .filter((team) => team.status === 'SHORTLISTED' || team.status === 'WAITLISTED')
    .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0));

  // 2. INELIGIBLE teams sorted by score descending for readability
  const ineligibleTeams = mockResults
    .filter((team) => team.status === 'INELIGIBLE')
    .sort((a, b) => b.score - a.score);

  return (
    <div>
      {/* Page heading + topX summary */}
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <h1 className="page-heading" style={{ marginBottom: 'var(--space-xs)' }}>
          Results
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-body)' }}>
          Showing {rankedTeams.length} ranked teams ({ineligibleTeams.length} ineligible) —{' '}
          <strong style={{ color: 'var(--color-text-primary)' }}>
            Top {topX} will be shortlisted.
          </strong>{' '}
          Click a team name to see the full score breakdown.
        </p>
      </div>

      {/* Ranked Teams Section */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Team Name</th>
              <th>Score</th>
              <th>Eligible</th>
              <th>Flags</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {rankedTeams.reduce((rows, result) => {
              const isShortlisted = result.status === 'SHORTLISTED';
              const isExpanded = expandedIds.has(result.team_id);

              rows.push(
                <ResultRow
                  key={result.team_id}
                  result={result}
                  isMuted={!isShortlisted}
                  isExpanded={isExpanded}
                  onToggle={() => toggleRow(result.team_id)}
                  rankDisplay={`#${result.rank}`}
                />
              );

              if (result.rank === topX) {
                rows.push(<CutoffRow key="cutoff" topX={topX} />);
              }

              return rows;
            }, [])}
          </tbody>
        </table>
      </div>

      {/* Ineligible Teams Section */}
      <div style={{ marginTop: 'var(--space-xl)' }}>
        <h2 className="section-heading">Ineligible Teams — Not Ranked</h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-body)', marginBottom: 'var(--space-md)' }}>
          Teams that failed mandatory eligibility rules are excluded from ranking regardless of score.
        </p>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Team Name</th>
                <th>Score</th>
                <th>Eligible</th>
                <th>Flags</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {ineligibleTeams.map((result) => (
                <ResultRow
                  key={result.team_id}
                  result={result}
                  isMuted={true}
                  isExpanded={expandedIds.has(result.team_id)}
                  onToggle={() => toggleRow(result.team_id)}
                  rankDisplay="—"
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
