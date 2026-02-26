/**
 * Builder.tsx
 * The Chatbot Flow Builder page — previously the root App component.
 *
 * Wraps all flow-builder state, routing between NodesPanel / SettingsPanel,
 * and the React Flow canvas. Accessible at /builder.
 *
 * The navbar includes a "← Back" button to return to the landing page.
 */

import { useState, useCallback, useRef } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { useNavigate } from 'react-router-dom';

import FlowBuilder from '@/components/FlowBuilder';
import NodesPanel from '@/components/NodesPanel';
import SettingsPanel from '@/components/SettingsPanel';
import Notification from '@/components/Notification';
import ExportMenu from '@/components/ExportMenu';

import { validateFlow } from '@/utils/validation';
import { exportFlowAsJSON } from '@/utils/exportFlow';
import { exportFlowAsImage } from '@/utils/exportImage';
import type { FlowNode, FlowEdge, NotificationState } from '@/types/nodeTypes';

import styles from './Builder.module.css';

// ─── Constants ────────────────────────────────────────────────────────────────

const NOTIFICATION_DURATION = 3500;
const INITIAL_NODE_COUNT = 1; // matches the starter node in FlowBuilder

// ─── Component ────────────────────────────────────────────────────────────────

const Builder = () => {
  const navigate = useNavigate();

  // ── Selected node state ───────────────────────────────────
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedNodeText, setSelectedNodeText] = useState<string>('');

  // ── Node count — drives Export button disabled state ──────
  const [nodeCount, setNodeCount] = useState<number>(INITIAL_NODE_COUNT);

  // ── Notification ──────────────────────────────────────────
  const [notification, setNotification] = useState<NotificationState>({ status: 'idle' });
  const notifTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showNotification = useCallback((n: NotificationState) => {
    if (notifTimerRef.current) clearTimeout(notifTimerRef.current);
    setNotification(n);
    notifTimerRef.current = setTimeout(
      () => setNotification({ status: 'idle' }),
      NOTIFICATION_DURATION,
    );
  }, []);

  // ── Function refs registered by FlowBuilder ───────────────

  const updateNodeTextFn = useRef<((id: string, text: string) => void) | null>(null);
  const registerUpdateText = useCallback(
    (fn: (id: string, text: string) => void) => { updateNodeTextFn.current = fn; },
    [],
  );

  const getFlowDataFn = useRef<(() => { nodes: FlowNode[]; edges: FlowEdge[] }) | null>(null);
  const registerGetFlowData = useCallback(
    (fn: () => { nodes: FlowNode[]; edges: FlowEdge[] }) => { getFlowDataFn.current = fn; },
    [],
  );

  const getFlowData = useCallback(
    (): { nodes: FlowNode[]; edges: FlowEdge[] } =>
      getFlowDataFn.current?.() ?? { nodes: [], edges: [] },
    [],
  );

  // ── Handlers ──────────────────────────────────────────────

  const handleSelectionChange = useCallback((nodeId: string | null) => {
    setSelectedNodeId(nodeId);
    if (nodeId) {
      const { nodes } = getFlowData();
      const node = nodes.find((n) => n.id === nodeId);
      setSelectedNodeText(node?.data.text ?? '');
    } else {
      setSelectedNodeText('');
    }
  }, [getFlowData]);

  const handleTextChange = useCallback((newText: string) => {
    setSelectedNodeText(newText);
    if (selectedNodeId && updateNodeTextFn.current) {
      updateNodeTextFn.current(selectedNodeId, newText);
    }
  }, [selectedNodeId]);

  const handleBack = useCallback(() => {
    setSelectedNodeId(null);
    setSelectedNodeText('');
  }, []);

  const handleSave = useCallback(() => {
    const { nodes, edges } = getFlowData();
    const result = validateFlow(nodes, edges);
    showNotification({ status: result.valid ? 'success' : 'error', message: result.message });
  }, [getFlowData, showNotification]);

  const handleExportJSON = useCallback(() => {
    const { nodes, edges } = getFlowData();
    try {
      exportFlowAsJSON(nodes, edges);
      showNotification({ status: 'success', message: 'Flow exported as JSON successfully!' });
    } catch (err) {
      showNotification({ status: 'error', message: 'Failed to export JSON. Please try again.' });
      console.error('[handleExportJSON]', err);
    }
  }, [getFlowData, showNotification]);

  const handleExportImage = useCallback(async () => {
    const result = await exportFlowAsImage();
    showNotification({
      status: result.success ? 'success' : 'error',
      message: result.success
        ? 'Canvas exported as PNG successfully!'
        : `Image export failed: ${result.error ?? 'Unknown error'}`,
    });
  }, [showNotification]);

  // ── Render ────────────────────────────────────────────────

  const showSettingsPanel = selectedNodeId !== null;

  return (
    <div className={styles.app}>
      {/* ── Top Navbar ────────────────────────────────── */}
      <nav className={styles.navbar} aria-label="Application toolbar">
        {/* Brand + back-to-home */}
        <div className={styles.navLeft}>
          <button
            className={styles.backBtn}
            onClick={() => navigate('/')}
            aria-label="Back to landing page"
            title="Back to home"
          >
            ←
          </button>
          <span className={styles.brandIcon} aria-hidden="true">🤖</span>
          <span className={styles.brandName}>FlowBot</span>
          <span className={styles.brandTag}>Builder</span>
        </div>

        {/* Action buttons */}
        <div className={styles.navActions}>
          <ExportMenu
            onExportJSON={handleExportJSON}
            onExportImage={handleExportImage}
            disabled={nodeCount === 0}
          />
          <button
            className={styles.saveButton}
            onClick={handleSave}
            aria-label="Save flow and validate"
          >
            💾 Save Flow
          </button>
        </div>
      </nav>

      {/* ── Main Content ──────────────────────────────── */}
      <main className={styles.main}>
        <ReactFlowProvider>
          <FlowBuilder
            onSelectionChange={handleSelectionChange}
            onNodesChange_external={(nodes) => setNodeCount(nodes.length)}
            onEdgesChange_external={(_edges) => { /* read via getFlowDataFn */ }}
            registerUpdateText={registerUpdateText}
            registerGetFlowData={registerGetFlowData}
          />
        </ReactFlowProvider>

        <aside className={styles.panel} aria-label="Node settings panel">
          {showSettingsPanel ? (
            <SettingsPanel
              selectedNodeText={selectedNodeText}
              onTextChange={handleTextChange}
              onBack={handleBack}
            />
          ) : (
            <NodesPanel />
          )}
        </aside>
      </main>

      <Notification notification={notification} />
    </div>
  );
};

export default Builder;
