/**
 * TextNode.tsx
 * Custom React Flow node representing a "Send Message" step in the chatbot flow.
 *
 * Layout:
 *   ┌──────────────────────────────┐
 *   │ 💬  Send Message   [header]  │
 *   ├──────────────────────────────┤
 *   │  <text content>    [body]    │
 *   └──────────────────────────────┘
 *   ◀ Target handle (left)   Source handle ▶ (right)
 *
 * Handles:
 *   - Target (left)  : Multiple incoming edges allowed.
 *   - Source (right) : Only ONE outgoing edge (enforced via isValidConnection
 *                      in FlowBuilder.tsx).
 */

import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { TextNodeData } from '../types/nodeTypes';
import styles from './TextNode.module.css';

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * TextNode
 * Rendered by React Flow for every node of type "textNode".
 * `selected` is injected automatically by React Flow when the node is clicked.
 */
const TextNode = ({ data, selected }: NodeProps<TextNodeData>) => {
  return (
    <div className={`text-node-wrapper ${styles.node} ${selected ? styles.selected : ''}`}>

      {/* ── Target Handle (left) — accepts multiple incoming edges ── */}
      <Handle
        type="target"
        position={Position.Left}
        id="target"
        // Connections TO this handle are always allowed.
        isConnectable
      />

      {/* ── Node Header ─────────────────────────────────────────── */}
      <div className={styles.header}>
        <span className={styles.headerIcon} aria-hidden="true">💬</span>
        <span className={styles.headerTitle}>Send Message</span>
      </div>

      {/* ── Node Body ───────────────────────────────────────────── */}
      <div className={styles.body}>
        {data.text ? (
          <p className={styles.bodyText}>{data.text}</p>
        ) : (
          <p className={styles.placeholder}>Double-click to edit…</p>
        )}
      </div>

      {/* ── Source Handle (right) — only ONE outgoing edge allowed ── */}
      <Handle
        type="source"
        position={Position.Right}
        id="source"
        // The "only-one-outgoing-edge" rule is enforced in FlowBuilder
        // via isValidConnection, not here.
        isConnectable
      />
    </div>
  );
};

// memo prevents unnecessary re-renders when parent updates unrelated state.
export default memo(TextNode);
