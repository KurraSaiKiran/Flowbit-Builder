/**
 * FlowBuilder.tsx
 * Core React Flow canvas component for the Chatbot Flow Builder.
 *
 * Responsibilities:
 *   1. Maintain nodes and edges state via React Flow hooks.
 *   2. Handle drag-and-drop from the NodesPanel to add new nodes.
 *   3. Enforce the one-outgoing-edge-per-source-handle rule.
 *   4. Track the selected node and expose its data to the parent (App).
 *   5. Expose an updateNodeText method to the parent via callback.
 *
 * Architecture note:
 *   FlowBuilder is wrapped in ReactFlowProvider (in App.tsx) so that
 *   useReactFlow() can be called inside child components if needed.
 */

import {
  useCallback,
  useRef,
  type DragEvent,
} from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  BackgroundVariant,
  type Connection,
  type Edge,
  type Node,
  type OnSelectionChangeParams,
} from 'reactflow';

// Always import React Flow's base styles — required for proper rendering.
import 'reactflow/dist/style.css';

import TextNode from './TextNode';
import type { FlowNode, FlowEdge, TextNodeData } from '../types/nodeTypes';
import styles from './FlowBuilder.module.css';

// ─── Node Type Registry ───────────────────────────────────────────────────────

/**
 * nodeTypes
 * Maps node type strings (stored in node.type) to their React components.
 * Must be defined OUTSIDE the component to prevent React Flow re-mounting
 * nodes on every render.
 *
 * Extensibility: add new node components here alongside NODE_TYPES_CONFIG
 * in NodesPanel.tsx.
 */
const nodeTypes = {
  textNode: TextNode,
  // futureNode: FutureNodeComponent,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Generates a unique incrementing node id. */
let nodeIdCounter = 1;
const generateNodeId = (): string => `node_${nodeIdCounter++}`;

// ─── Default initial nodes (optional starter node) ───────────────────────────

const initialNodes: FlowNode[] = [
  {
    id: 'node_0',
    type: 'textNode',
    position: { x: 180, y: 180 },
    data: { text: 'Hello! How can I help you today?' },
  },
];

const initialEdges: FlowEdge[] = [];

// ─── Props ────────────────────────────────────────────────────────────────────

interface FlowBuilderProps {
  /** Called whenever the selected node changes (id or null). */
  onSelectionChange: (nodeId: string | null) => void;
  /** Provides the parent with the current nodes array for validation. */
  onNodesChange_external: (nodes: FlowNode[]) => void;
  /** Provides the parent with the current edges array for validation. */
  onEdgesChange_external: (edges: FlowEdge[]) => void;
  /**
   * Callback ref: parent calls this function to update a node's text.
   * Using a callback prop avoids lifting all state to App.
   */
  registerUpdateText: (fn: (nodeId: string, text: string) => void) => void;
  /**
   * Registers a getter function the parent can call to retrieve the LATEST
   * nodes and edges (e.g. for export). This avoids stale-closure issues
   * because the getter captures the current React state at call time.
   */
  registerGetFlowData: (
    fn: () => { nodes: FlowNode[]; edges: FlowEdge[] },
  ) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const FlowBuilder = ({
  onSelectionChange,
  onNodesChange_external,
  onEdgesChange_external,
  registerUpdateText,
  registerGetFlowData,
}: FlowBuilderProps) => {
  // ── State — managed by React Flow hooks ──────────────────
  const [nodes, setNodes, onNodesChange] = useNodesState<TextNodeData>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // useReactFlow gives us screenToFlowPosition for precise drop placement.
  const { screenToFlowPosition } = useReactFlow();

  // Ref to the canvas wrapper div — needed to compute drop coordinates.
  const wrapperRef = useRef<HTMLDivElement>(null);

  // ── Register text-update function with the parent (App) ──
  // This avoids prop-drilling the entire nodes state upward.
  const updateNodeText = useCallback(
    (nodeId: string, newText: string) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId
            ? { ...n, data: { ...n.data, text: newText } }
            : n,
        ),
      );
    },
    [setNodes],
  );

  // Register once after component mounts.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  registerUpdateText(updateNodeText);

  // Register a getter that returns the CURRENT nodes/edges at call time.
  // The getter closes over the live `nodes` and `edges` state values so it
  // always returns up-to-date data regardless of when it is invoked.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  registerGetFlowData(() => ({
    nodes: nodes as FlowNode[],
    edges: edges as FlowEdge[],
  }));

  // ── Sync nodes/edges to parent for validation ────────────
  const handleNodesChange: typeof onNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);
      // We need to derive the next state — React Flow does this after the
      // call, so we schedule a micro-task to read the updated value.
      // A simpler pattern: use the functional form of setNodes to read current.
      setNodes((nds) => {
        onNodesChange_external(nds as FlowNode[]);
        return nds;
      });
    },
    [onNodesChange, setNodes, onNodesChange_external],
  );

  const handleEdgesChange: typeof onEdgesChange = useCallback(
    (changes) => {
      onEdgesChange(changes);
      setEdges((eds) => {
        onEdgesChange_external(eds as FlowEdge[]);
        return eds;
      });
    },
    [onEdgesChange, setEdges, onEdgesChange_external],
  );

  // ── Connection handler ────────────────────────────────────

  /**
   * isValidConnection
   * Called by React Flow before an edge is created.
   * Enforces: each source handle may have at most ONE outgoing edge.
   *
   * @param connection - The proposed connection (source, sourceHandle, target, targetHandle)
   * @returns true if the connection is allowed
   */
  const isValidConnection = useCallback(
    (connection: Connection): boolean => {
      // Prevent self-loops.
      if (connection.source === connection.target) return false;

      // Check if there is already an edge leaving the same source handle.
      const sourceAlreadyConnected = edges.some(
        (e: Edge) =>
          e.source === connection.source &&
          e.sourceHandle === connection.sourceHandle,
      );

      return !sourceAlreadyConnected;
    },
    [edges],
  );

  /**
   * onConnect
   * Adds a new edge to the state when a valid connection is made.
   */
  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => {
        const newEdges = addEdge(
          {
            ...connection,
            // Style the edge consistent with the design tokens.
            style: { stroke: 'var(--color-primary)', strokeWidth: 2 },
            animated: false,
          },
          eds,
        );
        onEdgesChange_external(newEdges as FlowEdge[]);
        return newEdges;
      });
    },
    [setEdges, onEdgesChange_external],
  );

  // ── Drag-and-Drop ─────────────────────────────────────────

  /**
   * onDragOver
   * Must call preventDefault to allow dropping and set the correct cursor.
   */
  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  /**
   * onDrop
   * Reads the node type from dataTransfer, converts screen coordinates to
   * React Flow canvas coordinates, and adds a new node at that position.
   */
  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      // Read the node type set by NodesPanel's onDragStart.
      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      // Convert the drop position from screen space to canvas (flow) space.
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Build the new node object.
      const newNode: Node<TextNodeData> = {
        id: generateNodeId(),
        type,
        position,
        data: { text: '' },
      };

      setNodes((nds) => {
        const next = [...nds, newNode];
        onNodesChange_external(next as FlowNode[]);
        return next;
      });
    },
    [screenToFlowPosition, setNodes, onNodesChange_external],
  );

  // ── Selection ─────────────────────────────────────────────

  /**
   * onSelectionChange
   * React Flow fires this callback whenever the selection changes.
   * We pass the first selected node's id (or null) to the parent.
   */
  const handleSelectionChange = useCallback(
    ({ nodes: selectedNodes }: OnSelectionChangeParams) => {
      if (selectedNodes.length > 0) {
        onSelectionChange(selectedNodes[0].id);
      } else {
        onSelectionChange(null);
      }
    },
    [onSelectionChange],
  );

  // ── Render ────────────────────────────────────────────────

  return (
    <div className={styles.canvasWrapper} ref={wrapperRef}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onSelectionChange={handleSelectionChange}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        deleteKeyCode="Delete"
        multiSelectionKeyCode="Shift"
        // Snap to grid for cleaner alignment
        snapToGrid
        snapGrid={[15, 15]}
      >
        {/* Dot-grid background */}
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#cbd5e1"
        />

        {/* Zoom / fit / lock controls — bottom left */}
        <Controls />

        {/* Mini-map — bottom right */}
        <MiniMap
          nodeStrokeWidth={3}
          nodeColor="#4f46e5"
          maskColor="rgba(241,245,249,0.7)"
          style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}
        />
      </ReactFlow>
    </div>
  );
};

export default FlowBuilder;
