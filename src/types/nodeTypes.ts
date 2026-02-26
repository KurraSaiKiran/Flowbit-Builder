/**
 * nodeTypes.ts
 * Central type definitions for the Chatbot Flow Builder.
 * Keeping all types in one place makes refactoring easy.
 */

import type { Node, Edge } from 'reactflow';

// ─── Node Data ────────────────────────────────────────────────────────────────

/**
 * Data payload stored inside every TextNode.
 * Extend this interface to add more fields to a text node.
 */
export interface TextNodeData {
  /** The message text displayed in the node body. */
  text: string;
}

// ─── Flow Aliases ─────────────────────────────────────────────────────────────

/** A React Flow Node specialised with TextNodeData. */
export type FlowNode = Node<TextNodeData>;

/** A React Flow Edge (no custom data needed for now). */
export type FlowEdge = Edge;

// ─── Panel Config ─────────────────────────────────────────────────────────────

/**
 * Describes one entry in the Nodes Panel.
 * Adding a new node type only requires pushing a new object here — no other
 * file needs to change (as long as the type is also registered in nodeTypes map).
 */
export interface NodeTypeConfig {
  /** Must match the key used in the ReactFlow `nodeTypes` prop. */
  type: string;
  /** Human-readable label shown in the panel card. */
  label: string;
  /** Emoji or icon representing the node type. */
  icon: string;
  /** Short description shown below the label. */
  description: string;
}

// ─── Notification ─────────────────────────────────────────────────────────────

/** Possible states for the in-app save notification. */
export type NotificationState =
  | { status: 'idle' }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string };
