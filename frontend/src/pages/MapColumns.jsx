import { useState } from 'react';
import { mockColumns } from '../mock/columns';

/**
 * The set of fields an organizer can map a raw column to.
 * Values must match the suggested_field strings in columns.js mock data
 * so that pre-selection via <select value={...}> works correctly.
 */
const FIELD_OPTIONS = [
  { value: 'team_name',     label: 'Team Name' },
  { value: 'member_name',   label: 'Member Name' },
  { value: 'github_url',    label: 'GitHub' },
  { value: 'linkedin_url',  label: 'LinkedIn' },
  { value: 'resume_url',    label: 'Resume' },
  { value: 'portfolio_url', label: 'Portfolio' },
  { value: 'ignore',        label: 'Ignore' },
];

/**
 * Maps a confidence level to a badge variant class + display text.
 * Never relies on color alone — text label is always shown inside the badge.
 */
function ConfidenceBadge({ confidence }) {
  const config = {
    high:      { modifier: 'badge--ok',      label: 'Auto-detected' },
    low:       { modifier: 'badge--missing', label: 'Low confidence' },
    unmatched: { modifier: 'badge--invalid', label: 'Unmatched' },
  };
  const { modifier, label } = config[confidence] ?? config.unmatched;
  return <span className={`badge ${modifier}`}>{label}</span>;
}

/**
 * A single row in the column mapping table.
 * Uses a real <select> element (not a div) for keyboard + screen-reader support.
 */
function MappingRow({ rawHeader, selectedField, confidence, onFieldChange }) {
  return (
    <tr>
      <td title={rawHeader}>
        <span style={{ fontFamily: 'var(--font-family)', color: 'var(--color-text-primary)' }}>
          {rawHeader}
        </span>
      </td>
      <td>
        {/* Real <select> preserves native focus outline and keyboard nav */}
        <select
          className="form-select"
          value={selectedField}
          onChange={(e) => onFieldChange(e.target.value)}
          aria-label={`Map column "${rawHeader}" to field`}
        >
          {FIELD_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </td>
      <td>
        <ConfidenceBadge confidence={confidence} />
      </td>
    </tr>
  );
}

export default function MapColumns() {
  // Local state: track each column's selected mapping, initialised from suggested_field.
  // Uses raw_header as the stable key since column objects have no id field.
  const [mappings, setMappings] = useState(() =>
    Object.fromEntries(mockColumns.map((col) => [col.raw_header, col.suggested_field]))
  );

  function handleFieldChange(rawHeader, newField) {
    setMappings((prev) => ({ ...prev, [rawHeader]: newField }));
  }

  return (
    <div>
      <h1 className="page-heading">Map Columns</h1>

      <div className="card">
        <h2 className="section-heading">Column Mapping</h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-body)', marginBottom: 'var(--space-md)' }}>
          Review and correct how each column from your upload maps to a known field.
          Auto-detected mappings are pre-filled — adjust any that look wrong.
        </p>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Raw Column Header</th>
                <th>Maps To</th>
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {mockColumns.map((col) => (
                <MappingRow
                  key={col.raw_header}
                  rawHeader={col.raw_header}
                  selectedField={mappings[col.raw_header]}
                  confidence={col.confidence}
                  onFieldChange={(newField) => handleFieldChange(col.raw_header, newField)}
                />
              ))}
            </tbody>
          </table>
        </div>

        <p style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-md)' }}>
          {mockColumns.length} columns detected · Changes are local only — save/submit action will be added in a later step.
        </p>
      </div>
    </div>
  );
}
