/**
 * exportFlow.ts
 * Utility for exporting the current flow as a clean JSON file.
 *
 * Only serialises the fields needed to reconstruct the flow —
 * React Flow's internal runtime fields (selected, dragging, etc.)
 * are deliberately stripped out to keep the export portable.
 */

import type { FlowNode, FlowEdge } from '../types/nodeTypes';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Shape of a single node in the exported JSON. */
interface ExportedNode {
  id: string;
  type: string | undefined;
  position: { x: number; y: number };
  data: { text: string };
}

/** Shape of a single edge in the exported JSON. */
interface ExportedEdge {
  id: string;
  source: string;
  target: string;
}

/** Top-level structure of the exported flow JSON. */
export interface ExportedFlow {
  nodes: ExportedNode[];
  edges: ExportedEdge[];
}

// ─── Helper: date string ──────────────────────────────────────────────────────

/**
 * Returns today's date in YYYY-MM-DD format for use in the filename.
 */
const getTodayString = (): string => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// ─── Helper: trigger browser download ────────────────────────────────────────

/**
 * Triggers a browser file download for the given content.
 *
 * @param content  - String content to write to the file
 * @param filename - Name of the downloaded file
 * @param mimeType - MIME type (e.g. 'application/json')
 */
const triggerDownload = (
  content: string,
  filename: string,
  mimeType: string,
): void => {
  // Create an in-memory Blob containing the file content.
  const blob = new Blob([content], { type: mimeType });

  // Build a temporary object URL pointing to the Blob.
  const url = URL.createObjectURL(blob);

  // Create a hidden <a> element, click it to start the download, then clean up.
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();

  // Clean up: remove the element and revoke the URL to free memory.
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

// ─── Main Export Function ─────────────────────────────────────────────────────

/**
 * exportFlowAsJSON
 * Strips internal React Flow fields, serialises to JSON, and triggers a
 * browser download.
 *
 * @param nodes - Current React Flow nodes array
 * @param edges - Current React Flow edges array
 */
export const exportFlowAsJSON = (
  nodes: FlowNode[],
  edges: FlowEdge[],
): void => {
  // Build a clean, minimal representation of each node.
  const cleanNodes: ExportedNode[] = nodes.map((node) => ({
    id: node.id,
    type: node.type,
    position: { x: node.position.x, y: node.position.y },
    data: { text: node.data.text },
  }));

  // Build a clean, minimal representation of each edge.
  const cleanEdges: ExportedEdge[] = edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
  }));

  const flowData: ExportedFlow = { nodes: cleanNodes, edges: cleanEdges };

  // Prettify with 2-space indent for human-readable output.
  const jsonString = JSON.stringify(flowData, null, 2);

  triggerDownload(
    jsonString,
    `chatbot-flow-${getTodayString()}.json`,
    'application/json',
  );
};
