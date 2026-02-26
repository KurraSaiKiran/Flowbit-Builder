/**
 * exportImage.ts
 * Utility for exporting the React Flow canvas as a PNG image.
 *
 * Uses `html-to-image` (toPng) to rasterise the entire .react-flow element,
 * including nodes, edges and the background grid.
 *
 * Important notes:
 *   - We target `.react-flow` (the outermost React Flow wrapper) so the
 *     full canvas is captured rather than just the visible viewport.
 *   - The export happens at the current zoom level. Users should zoom-to-fit
 *     before exporting if they want all nodes visible.
 *   - We wrap everything in try/catch and surface errors to the caller so
 *     the UI can display a notification instead of a silent failure.
 */

import { toPng } from 'html-to-image';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ImageExportResult {
  success: boolean;
  error?: string;
}

// ─── Main Export Function ─────────────────────────────────────────────────────

/**
 * exportFlowAsImage
 * Captures the React Flow canvas as a PNG and triggers a browser download.
 *
 * @returns ImageExportResult indicating success or failure with an error message.
 */
export const exportFlowAsImage = async (): Promise<ImageExportResult> => {
  try {
    // Locate the React Flow root element.
    // React Flow renders a div with class "react-flow" at the top of the canvas.
    const flowElement = document.querySelector('.react-flow');

    if (!flowElement) {
      return {
        success: false,
        error: 'Could not find the flow canvas element.',
      };
    }

    // toPng renders the element (and all its descendants) to a PNG data URL.
    // Options:
    //   backgroundColor — fill transparent areas with white for a clean export.
    //   pixelRatio      — use 2× for crisp high-DPI output.
    //   cacheBust       — appends a query string to image URLs to bypass browser
    //                     cache (avoids CORS taint issues in some environments).
    const dataUrl = await toPng(flowElement as HTMLElement, {
      backgroundColor: '#f1f5f9', // matches --color-canvas-bg
      pixelRatio: 2,
      cacheBust: true,
    });

    // Build a temporary <a> element to trigger the download.
    const link = document.createElement('a');
    link.download = 'chatbot-flow.png';
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return { success: true };
  } catch (err) {
    // Surface the error message to the caller for notification display.
    const message =
      err instanceof Error ? err.message : 'Unknown error during image export.';
    console.error('[exportFlowAsImage]', err);
    return { success: false, error: message };
  }
};
