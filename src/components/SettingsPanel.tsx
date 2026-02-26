/**
 * SettingsPanel.tsx
 * Right-sidebar panel shown when a node is selected.
 *
 * Responsibilities:
 *   - Display a back button to deselect the node (returns to NodesPanel).
 *   - Show a textarea bound to the selected node's text.
 *   - Propagate text changes upward via the `onTextChange` callback so the
 *     parent (FlowBuilder) can update the node's data in place.
 *
 * Props:
 *   selectedNodeText  — current text of the selected node (controlled)
 *   onTextChange      — called with the new text on every keystroke
 *   onBack            — called when the user clicks the back/deselect button
 */

import styles from './SettingsPanel.module.css';

// ─── Props ────────────────────────────────────────────────────────────────────

interface SettingsPanelProps {
  /** Current text value of the selected node — kept in sync with node data. */
  selectedNodeText: string;
  /** Fired on every keystroke to update the node's text in real time. */
  onTextChange: (newText: string) => void;
  /** Fired when the user clicks the back button — deselects the node. */
  onBack: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const SettingsPanel = ({
  selectedNodeText,
  onTextChange,
  onBack,
}: SettingsPanelProps) => {
  return (
    <div className={styles.panel}>

      {/* ── Header: back button + title ─────────────────── */}
      <div className={styles.header}>
        <button
          className={styles.backButton}
          onClick={onBack}
          aria-label="Deselect node and return to Nodes panel"
          title="Back"
        >
          ←
        </button>
        <span className={styles.headerTitle}>Message Settings</span>
      </div>

      {/* ── Settings Form Body ──────────────────────────── */}
      <div className={styles.body}>
        <div className={styles.section}>
          <label className={styles.label} htmlFor="node-text-input">
            Text
          </label>

          {/*
            Controlled textarea — every change propagates up to FlowBuilder
            which updates the node's data, triggering a re-render of the node.
          */}
          <textarea
            id="node-text-input"
            className={styles.textarea}
            value={selectedNodeText}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="Type your message here…"
            rows={4}
            autoFocus
          />
          <p className={styles.hint}>
            Changes are applied to the node in real time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
