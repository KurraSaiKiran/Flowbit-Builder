/**
 * ExportMenu.tsx
 * Dropdown button for exporting the flow as JSON or PNG image.
 *
 * Behaviour:
 *   - Clicking "Export ▼" opens the dropdown.
 *   - Clicking outside the dropdown closes it (via a global mousedown listener).
 *   - The button is disabled when there are no nodes on the canvas.
 *   - "Download Image (PNG)" is async — shows a loading label while in progress.
 *   - Results (success/error) are surfaced to the parent via `onResult` so the
 *     existing Notification component can display the feedback.
 *
 * Props:
 *   onExportJSON   — called when the user clicks "Download JSON"
 *   onExportImage  — async; called when the user clicks "Download Image (PNG)"
 *   disabled       — disables the entire button (when canvas is empty)
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './ExportMenu.module.css';

// ─── Props ────────────────────────────────────────────────────────────────────

interface ExportMenuProps {
  /** Triggers the JSON export. */
  onExportJSON: () => void;
  /** Triggers the image export (async). */
  onExportImage: () => Promise<void>;
  /** Disables the trigger button when the canvas is empty. */
  disabled?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

const ExportMenu = ({
  onExportJSON,
  onExportImage,
  disabled = false,
}: ExportMenuProps) => {
  // Controls dropdown open/close state.
  const [isOpen, setIsOpen] = useState(false);

  // Tracks whether image export is in progress.
  const [imageLoading, setImageLoading] = useState(false);

  // Ref to the wrapper div — used to detect outside clicks.
  const wrapperRef = useRef<HTMLDivElement>(null);

  // ── Close on outside click ──────────────────────────────

  useEffect(() => {
    if (!isOpen) return;

    /**
     * handleOutsideClick
     * Closes the dropdown if a click occurs outside the wrapper element.
     * We use `mousedown` (not `click`) so it fires before the element
     * loses focus, preventing flicker on some browsers.
     */
    const handleOutsideClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  // ── Handlers ──────────────────────────────────────────────

  const toggleMenu = useCallback(() => {
    if (!disabled) setIsOpen((prev) => !prev);
  }, [disabled]);

  /** Handles JSON export: delegates to prop, then closes menu. */
  const handleExportJSON = useCallback(() => {
    onExportJSON();
    setIsOpen(false);
  }, [onExportJSON]);

  /**
   * Handles image export: sets loading state, awaits the async export,
   * then resets and closes the menu.
   */
  const handleExportImage = useCallback(async () => {
    setImageLoading(true);
    try {
      await onExportImage();
    } finally {
      setImageLoading(false);
      setIsOpen(false);
    }
  }, [onExportImage]);

  // ── Render ────────────────────────────────────────────────

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      {/* ── Trigger Button ─────────────────────────── */}
      <button
        className={styles.button}
        onClick={toggleMenu}
        disabled={disabled}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Export flow options"
        title={disabled ? 'Add nodes to the canvas before exporting' : 'Export flow'}
      >
        <span>⬇️ Export</span>
        <span
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
          aria-hidden="true"
        >
          ▾
        </span>
      </button>

      {/* ── Dropdown Menu ──────────────────────────── */}
      {isOpen && (
        <div
          className={styles.dropdown}
          role="menu"
          aria-label="Export options"
        >
          {/* Section label */}
          <div className={styles.dropdownHeader}>Export as</div>

          <ul className={styles.list}>
            {/* ── JSON option ───────────────────── */}
            <li>
              <button
                className={styles.item}
                role="menuitem"
                onClick={handleExportJSON}
                aria-label="Download flow as JSON file"
              >
                <span className={styles.itemIcon} aria-hidden="true">📄</span>
                <span className={styles.itemContent}>
                  <span className={styles.itemLabel}>Download JSON</span>
                  <span className={styles.itemSub}>Flow structure file</span>
                </span>
              </button>
            </li>

            {/* ── PNG image option ──────────────── */}
            <li>
              <button
                className={`${styles.item} ${imageLoading ? styles.itemLoading : ''}`}
                role="menuitem"
                onClick={handleExportImage}
                disabled={imageLoading}
                aria-label="Download flow as PNG image"
                aria-busy={imageLoading}
              >
                <span className={styles.itemIcon} aria-hidden="true">
                  {imageLoading ? '⏳' : '🖼️'}
                </span>
                <span className={styles.itemContent}>
                  <span className={styles.itemLabel}>
                    {imageLoading ? 'Generating…' : 'Download Image (PNG)'}
                  </span>
                  <span className={styles.itemSub}>Canvas screenshot</span>
                </span>
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ExportMenu;
