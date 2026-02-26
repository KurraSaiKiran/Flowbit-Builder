/**
 * validation.ts
 * Flow validation utilities for the Chatbot Flow Builder.
 *
 * Validation Rule:
 *   A flow is INVALID when:
 *   - There is more than one node, AND
 *   - More than one node has NO incoming edges (empty target handle).
 *
 *   In a valid connected flow every node (except possibly the starting node)
 *   should have at least one incoming edge.
 */

import type { FlowNode, FlowEdge } from '../types/nodeTypes';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ValidationResult {
  /** true  → flow is valid and can be saved */
  valid: boolean;
  /** Human-readable feedback message shown in the notification */
  message: string;
}

// ─── Core Validation ─────────────────────────────────────────────────────────

/**
 * validateFlow
 * Checks whether the current node/edge graph satisfies the save conditions.
 *
 * @param nodes - Current array of React Flow nodes
 * @param edges - Current array of React Flow edges
 * @returns     ValidationResult with `valid` flag and user-facing `message`
 */
export const validateFlow = (
  nodes: FlowNode[],
  edges: FlowEdge[],
): ValidationResult => {
  // Edge-case: an empty canvas or single node is always valid.
  if (nodes.length <= 1) {
    return { valid: true, message: 'Flow saved successfully!' };
  }

  // Collect every node id that appears as an edge target.
  // A node with at least one incoming edge has its id in this set.
  const nodesWithIncoming = new Set(edges.map((e) => e.target));

  // Nodes whose id is NOT in the set have no incoming edges.
  const nodesWithoutIncoming = nodes.filter(
    (node) => !nodesWithIncoming.has(node.id),
  );

  // Only one "root" node (no incoming edges) is allowed.
  if (nodesWithoutIncoming.length > 1) {
    return {
      valid: false,
      message:
        'Cannot save flow: More than one node has empty target handles.',
    };
  }

  return { valid: true, message: 'Flow saved successfully!' };
};
