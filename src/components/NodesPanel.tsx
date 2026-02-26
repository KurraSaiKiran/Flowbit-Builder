/**
 * NodesPanel.tsx
 * Right-sidebar panel shown when NO node is selected.
 *
 * Renders a configurable list of node type cards that users can drag onto
 * the React Flow canvas. Designed to be extensible: add a new entry to
 * NODE_TYPES_CONFIG and it automatically appears here.
 *
 * Drag-and-Drop (HTML5 API):
 *   onDragStart → writes the node type string into dataTransfer.
 *   FlowBuilder listens for onDrop → reads the type → creates the node.
 */

import type { NodeTypeConfig } from '../types/nodeTypes';
import styles from './NodesPanel.module.css';

// ─── Extensible Node Type Registry ───────────────────────────────────────────

/**
 * NODE_TYPES_CONFIG
 * Single source of truth for all available node types shown in the panel.
 * To add a new node type:
 *   1. Push a new object here.
 *   2. Create the corresponding component.
 *   3. Register it in the `nodeTypes` map inside FlowBuilder.tsx.
 */
export const NODE_TYPES_CONFIG: NodeTypeConfig[] = [
  {
    type: 'textNode',
    label: 'Message',
    icon: '💬',
    description: 'Send a text message',
  },
  // ── Future node types can be added here ──
  // { type: 'imageNode', label: 'Image',    icon: '🖼️',  description: 'Send an image'         },
  // { type: 'delayNode', label: 'Delay',    icon: '⏱️',  description: 'Add a time delay'       },
  // { type: 'conditionNode', label: 'Condition', icon: '🔀', description: 'Branch the flow'   },
];

// ─── Component ────────────────────────────────────────────────────────────────

const NodesPanel = () => {
  /**
   * handleDragStart
   * Stores the node type in the drag event's dataTransfer payload.
   * FlowBuilder's onDrop handler reads this value to know which node to create.
   */
  const handleDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    nodeType: string,
  ) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    // effectAllowed controls the cursor shown during drag.
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className={styles.panel}>
      {/* ── Panel Header ─────────────────────────────────── */}
      <div className={styles.header}>
        <h2 className={styles.title}>Nodes</h2>
        <p className={styles.subtitle}>Drag a node onto the canvas to add it</p>
      </div>

      {/* ── Node Type Cards Grid ──────────────────────────── */}
      <div className={styles.grid}>
        {NODE_TYPES_CONFIG.map((config) => (
          <div
            key={config.type}
            className={styles.card}
            draggable
            onDragStart={(e) => handleDragStart(e, config.type)}
            aria-label={`Drag ${config.label} node onto canvas`}
            title={config.description}
          >
            <span className={styles.cardIcon} aria-hidden="true">
              {config.icon}
            </span>
            <span className={styles.cardLabel}>{config.label}</span>
            <span className={styles.cardDescription}>{config.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NodesPanel;
