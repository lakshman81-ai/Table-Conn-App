import React, { useState, useEffect } from 'react';
import Xarrow, { Xwrapper, useXarrow } from 'react-xarrows';
import Table_Conn_Table from './Table_Conn_Table';
import './Table_Conn_styles.css';
import useLogs from './hooks/useLogs';
import useTables from './hooks/useTables';
import useConnections from './hooks/useConnections';

const WorkspaceArea = ({ children }) => {
  const updateXarrow = useXarrow();
  return (
    <div
      className="tc-workspace"
      onScroll={updateXarrow}
      style={{ flex: 1, position: 'relative', overflow: 'auto' }}
    >
      {children}
    </div>
  );
};

// Generate machine-readable syntax from connections
function generateSyntaxOutput(connections) {
  const lines = [];
  lines.push('-- TABLE CONNECTOR SYNTAX OUTPUT');
  lines.push(`-- Connections: ${connections.length}`);
  lines.push('');

  connections.forEach(conn => {
    if (conn.nodes.length < 1) return;
    const label = conn.instructions ? ` (${conn.instructions})` : '';
    lines.push(`-- ${conn.id}${label}`);

    if (conn.nodes.length === 1) {
      const n = conn.nodes[0];
      lines.push(`${n.tableName}.${n.headerName} -> ??? (pending)`);
    } else {
      const chain = conn.nodes.map(n => `${n.tableName}.${n.headerName}`).join(' -> ');
      const instrPart = conn.instructions ? ` [instruction="${conn.instructions}"]` : '';
      lines.push(`${chain}${instrPart}`);
    }
    lines.push('');
  });

  return lines.join('\n');
}

export default function Table_Conn_App() {
  const { logs, addLog } = useLogs();
  const { tables, handleFileUpload } = useTables(addLog);
  const {
    connections,
    selectedNodes,
    selectedConnectionId,
    setSelectedConnectionId,
    contextMenu,
    setContextMenu,
    columnLabels,
    handleNodeClick,
    createConnection,
    handleNodeContextMenu,
    handleSetStart,
    handleSetEnd,
    handleUpdateInstruction,
    handleLabelColumn,
    handleRemoveFromConnection,
    handleDisconnectNode,
    deleteConnection,
    doubleClickMenu,
    setDoubleClickMenu,
    handleNodeDoubleClick,
    addNodeToNewConnection,
    addNodeToConnection
  } = useConnections(tables, addLog);

  const [showLines, setShowLines] = useState(true);
  const [activePanelTab, setActivePanelTab] = useState('connections');
  const [editingInstructionId, setEditingInstructionId] = useState(null);
  const [editingInstructionText, setEditingInstructionText] = useState('');
  const [copiedSyntax, setCopiedSyntax] = useState(false);

  // Keyboard Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (selectedNodes.size > 1) createConnection();
      } else if (e.code === 'Delete' || e.code === 'Backspace') {
        deleteConnection();
      } else if (e.code === 'Escape') {
        setContextMenu({ ...contextMenu, visible: false });
        setEditingInstructionId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodes, createConnection, deleteConnection, contextMenu, setContextMenu]);

  const handleWorkspaceClick = (e) => {
    if (contextMenu.visible) setContextMenu({ ...contextMenu, visible: false });
    if (e.target.classList.contains('tc-workspace')) setSelectedConnectionId(null);
  };

  const saveInlineInstruction = (connId) => {
    handleUpdateInstruction(connId, editingInstructionText);
    setEditingInstructionId(null);
  };

  const handleCopySyntax = () => {
    navigator.clipboard.writeText(generateSyntaxOutput(connections)).then(() => {
      setCopiedSyntax(true);
      setTimeout(() => setCopiedSyntax(false), 1500);
    });
  };

  const handleContextLabelColumn = () => {
    const label = window.prompt('Enter a display label for this column (leave blank to clear):',
      columnLabels[contextMenu.nodeId] || '');
    if (label !== null) {
      handleLabelColumn(contextMenu.nodeId, label);
    }
  };

  return (
    <div className="tc-container" onClick={handleWorkspaceClick}>

      {/* ── Header ── */}
      <div className="tc-header">
        <div className="tc-header-brand">
          <span style={{ fontSize: 20 }}>⊞</span>
          <h2>Table Connector</h2>
          <span className="tc-header-subtitle">CSV Visual Mapper</span>
        </div>

        <div className="tc-header-toolbar">
          <span className={`tc-status-hint${selectedConnectionId ? ' has-selection' : ''}`}>
            {selectedConnectionId
              ? `Selected: ${selectedConnectionId} — Press Del to delete`
              : selectedNodes.size > 0
                ? `${selectedNodes.size} node(s) selected — Press Space to connect`
                : 'Click columns to select · Space to connect'}
          </span>

          <div className="tc-toolbar-divider" />

          <button
            className={`tc-btn-toggle ${showLines ? 'active' : 'inactive'}`}
            onClick={() => setShowLines(!showLines)}
          >
            {showLines ? '◉ Lines On' : '○ Lines Off'}
          </button>

          <label className="tc-btn-primary" style={{ cursor: 'pointer' }}>
            ↑ Load CSVs
            <input
              type="file"
              accept=".csv"
              multiple
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </label>

          <div className="tc-toolbar-divider" />

          <button className="tc-btn-icon" disabled title="Zoom In (coming soon)">+</button>
          <button className="tc-btn-icon" disabled title="Zoom Out (coming soon)">−</button>
          <button className="tc-btn-icon" disabled title="Reset View (coming soon)">⌂</button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ── Workspace ── */}
        <Xwrapper>
        <WorkspaceArea>
            {/* Empty state */}
            {tables.length === 0 && (
              <div className="tc-empty-state">
                <div className="tc-empty-state-icon">📂</div>
                <h3>No Tables Loaded</h3>
                <p>Load one or more CSV files to start mapping column connections.</p>
                <div className="tc-empty-state-shortcuts">
                  <div className="tc-shortcut-row">
                    <span className="tc-shortcut-key">Click</span>
                    <span>Select a column node</span>
                  </div>
                  <div className="tc-shortcut-row">
                    <span className="tc-shortcut-key">Space</span>
                    <span>Connect selected nodes</span>
                  </div>
                  <div className="tc-shortcut-row">
                    <span className="tc-shortcut-key">Del</span>
                    <span>Delete selected connection</span>
                  </div>
                  <div className="tc-shortcut-row">
                    <span className="tc-shortcut-key">Right-click</span>
                    <span>Node context menu</span>
                  </div>
                  <div className="tc-shortcut-row">
                    <span className="tc-shortcut-key">Dbl-click</span>
                    <span>Add to connection</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tables */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', padding: 20, paddingBottom: 100 }}>
              {tables.map(table => (
                <Table_Conn_Table
                  key={table.id}
                  table={table}
                  selectedNodes={selectedNodes}
                  connections={connections}
                  onNodeClick={handleNodeClick}
                  onNodeContextMenu={handleNodeContextMenu}
                  onNodeDoubleClick={handleNodeDoubleClick}
                  columnLabels={columnLabels}
                />
              ))}
            </div>

            {/* Connection lines */}
            {showLines && connections.map(conn => {
              if (conn.nodes.length < 2) return null;
              return conn.nodes.slice(0, -1).map((node, i) => {
                const startId = `node-${node.id}`;
                const endId = `node-${conn.nodes[i + 1].id}`;
                const isSelected = selectedConnectionId === conn.id;

                let labelElement = null;
                if (editingInstructionId === conn.id) {
                  labelElement = (
                    <div className="tc-instruction-overlay" onClick={e => e.stopPropagation()}>
                      <input
                        autoFocus
                        value={editingInstructionText}
                        onChange={e => setEditingInstructionText(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') saveInlineInstruction(conn.id);
                          if (e.key === 'Escape') setEditingInstructionId(null);
                        }}
                        placeholder="e.g. LEFT JOIN"
                      />
                      <button
                        style={{ background: '#007bff', color: '#fff' }}
                        onClick={() => saveInlineInstruction(conn.id)}
                      >Save</button>
                      <button
                        style={{ background: '#eee' }}
                        onClick={() => setEditingInstructionId(null)}
                      >✕</button>
                    </div>
                  );
                } else if (conn.instructions) {
                  labelElement = (
                    <div
                      className="tc-arrow-label"
                      onClick={e => {
                        e.stopPropagation();
                        setEditingInstructionText(conn.instructions);
                        setEditingInstructionId(conn.id);
                      }}
                      title="Click to edit instruction"
                    >
                      {conn.instructions}
                    </div>
                  );
                } else {
                  labelElement = (
                    <div
                      className="tc-arrow-label"
                      style={{ color: '#aaa', fontStyle: 'italic' }}
                      onClick={e => {
                        e.stopPropagation();
                        setEditingInstructionText('');
                        setEditingInstructionId(conn.id);
                      }}
                      title="Click to add instruction"
                    >
                      + add label
                    </div>
                  );
                }

                return (
                  <Xarrow
                    key={`${conn.id}-${i}`}
                    start={startId}
                    end={endId}
                    color={conn.color}
                    strokeWidth={isSelected ? 5 : 3}
                    headSize={6}
                    curveness={0.4}
                    path="smooth"
                    startAnchor="bottom"
                    endAnchor="top"
                    labels={{ middle: labelElement }}
                    passProps={{
                      onClick: (e) => {
                        e.stopPropagation();
                        setSelectedConnectionId(conn.id);
                        addLog(`Selected Connection: ${conn.id}`);
                      },
                      style: { cursor: 'pointer' }
                    }}
                  />
                );
              });
            })}

            {/* Workspace controls (placeholder) */}
            <div className="tc-workspace-controls">
              <button className="tc-workspace-ctrl-btn" disabled title="Zoom In (coming soon)">+</button>
              <button className="tc-workspace-ctrl-btn" disabled title="Zoom Out (coming soon)">−</button>
              <button className="tc-workspace-ctrl-btn" disabled title="Reset (coming soon)">⌂</button>
            </div>
        </WorkspaceArea>
        </Xwrapper>

        {/* ── Right Panel ── */}
        <div className="tc-right-panel">
          {/* Tab Bar */}
          <div className="tc-panel-tabs">
            <div
              className={`tc-panel-tab${activePanelTab === 'connections' ? ' active' : ''}`}
              onClick={() => setActivePanelTab('connections')}
            >
              Connections
              {connections.length > 0 && (
                <span className="tc-panel-tab-badge">{connections.length}</span>
              )}
            </div>
            <div
              className={`tc-panel-tab${activePanelTab === 'syntax' ? ' active' : ''}`}
              onClick={() => setActivePanelTab('syntax')}
            >
              Syntax
            </div>
            <div
              className={`tc-panel-tab${activePanelTab === 'log' ? ' active' : ''}`}
              onClick={() => setActivePanelTab('log')}
            >
              Log
            </div>
          </div>

          {/* Panel Body */}
          <div className="tc-panel-body">

            {/* ── Connections Tab ── */}
            {activePanelTab === 'connections' && (
              <>
                {connections.length === 0 ? (
                  <div className="tc-panel-empty">
                    <div className="tc-panel-empty-icon">○</div>
                    <div style={{ fontSize: 13 }}>No connections yet</div>
                    <div style={{ fontSize: 11, marginTop: 4, color: '#45475a' }}>
                      Select 2+ column nodes, then press Space
                    </div>
                  </div>
                ) : connections.map(conn => {
                  const connInstr = conn.instructions;
                  return (
                    <div
                      key={conn.id}
                      className="tc-conn-card"
                      style={{ borderLeftColor: conn.color }}
                    >
                      <div className="tc-conn-card-header">
                        <div
                          style={{
                            width: 14, height: 14, borderRadius: '50%',
                            background: conn.color, flexShrink: 0
                          }}
                        />
                        <span className="tc-conn-card-id">{conn.id}</span>
                        <span className="tc-conn-card-meta">
                          {conn.nodes.length < 2
                            ? `${conn.nodes.length} node — pending`
                            : `${conn.nodes.length} nodes`}
                        </span>
                      </div>

                      <div className="tc-conn-card-nodes">
                        {conn.nodes.length === 0
                          ? <span style={{ color: '#45475a', fontStyle: 'italic' }}>No nodes</span>
                          : conn.nodes.map((n, i) => (
                            <span key={n.id}>
                              {i > 0 && <span className="tc-conn-card-arrow"> → </span>}
                              <span style={{ color: '#89b4fa' }}>{n.tableName}</span>
                              <span style={{ color: '#cba6f7' }}>.{n.headerName}</span>
                            </span>
                          ))
                        }
                      </div>

                      {/* Inline instruction editor */}
                      <div className="tc-instruction-field">
                        <input
                          className="tc-instruction-input"
                          placeholder="Add instruction (e.g. LEFT JOIN)…"
                          value={connInstr}
                          onChange={e => handleUpdateInstruction(conn.id, e.target.value)}
                        />
                        <button
                          className="tc-instruction-save-btn"
                          onClick={() => addLog(`Connection ${conn.id}: Instruction updated.`)}
                        >
                          ✓
                        </button>
                      </div>

                      {/* Start/End info */}
                      {(conn.startNode || conn.endNode) && (
                        <div style={{ fontSize: 10, color: '#6c7086', marginTop: 4 }}>
                          {conn.startNode && <span style={{ color: '#a6e3a1', marginRight: 8 }}>▶ Start set</span>}
                          {conn.endNode && <span style={{ color: '#f38ba8' }}>■ End set</span>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )}

            {/* ── Syntax Tab ── */}
            {activePanelTab === 'syntax' && (
              <>
                {connections.length === 0 ? (
                  <pre className="tc-syntax-block" style={{ color: '#45475a', fontStyle: 'italic' }}>
                    {`-- No connections to display\n-- Load CSVs and create\n-- connections to see output`}
                  </pre>
                ) : (
                  <pre className="tc-syntax-block">
                    {generateSyntaxOutput(connections)}
                  </pre>
                )}
                <button
                  className={`tc-copy-btn${copiedSyntax ? ' copied' : ''}`}
                  onClick={handleCopySyntax}
                  disabled={connections.length === 0}
                >
                  {copiedSyntax ? '✓ Copied!' : '⎘ Copy Syntax to Clipboard'}
                </button>
              </>
            )}

            {/* ── Log Tab ── */}
            {activePanelTab === 'log' && (
              <>
                {logs.length === 0
                  ? <div className="tc-panel-empty">
                      <div style={{ fontSize: 11, color: '#45475a' }}>No activity yet</div>
                    </div>
                  : logs.map((log, i) => (
                    <div key={i} className="tc-log-entry">{log}</div>
                  ))
                }
              </>
            )}
          </div>

          <div className="tc-panel-version">ver.15-02-26</div>
        </div>
      </div>

      {/* ── Context Menu ── */}
      {contextMenu.visible && (
        <div
          className="tc-context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={e => e.stopPropagation()}
        >
          {contextMenu.isConnected ? (
            <>
              <div className="tc-context-section-label">Connection: {contextMenu.connectionId}</div>

              <div className="tc-context-item" onClick={handleSetStart}>
                <span className="tc-context-item-icon">▶</span>Set as Start Node
              </div>
              <div className="tc-context-item" onClick={handleSetEnd}>
                <span className="tc-context-item-icon">■</span>Set as End Node
              </div>

              <div className="tc-context-divider" />

              <div className="tc-context-item" onClick={() => {
                const conn = connections.find(c => c.id === contextMenu.connectionId);
                const current = conn?.instructions || '';
                setEditingInstructionText(current);
                setEditingInstructionId(contextMenu.connectionId);
                setContextMenu({ ...contextMenu, visible: false });
              }}>
                <span className="tc-context-item-icon">i</span>Add / Edit Instruction…
              </div>
              <div className="tc-context-item" onClick={handleContextLabelColumn}>
                <span className="tc-context-item-icon">T</span>Label this Column…
              </div>

              <div className="tc-context-divider" />

              <div
                className="tc-context-item tc-context-item-danger"
                onClick={() => handleRemoveFromConnection(contextMenu.connectionId, contextMenu.nodeId)}
              >
                <span className="tc-context-item-icon">✕</span>Remove from Connection
              </div>
              <div
                className="tc-context-item tc-context-item-danger"
                onClick={() => handleDisconnectNode(contextMenu.nodeId)}
              >
                <span className="tc-context-item-icon">~</span>Disconnect Node (all)
              </div>

              <div className="tc-context-divider" />

              <div className="tc-context-item" onClick={() => {
                setActivePanelTab('connections');
                setContextMenu({ ...contextMenu, visible: false });
              }}>
                <span className="tc-context-item-icon">?</span>View Connection Details
              </div>
            </>
          ) : (
            <>
              <div className="tc-context-section-label">Unconnected Node</div>
              <div className="tc-context-item" onClick={() => {
                const [tId, ...rest] = contextMenu.nodeId.split('-');
                const parts = contextMenu.nodeId.split('-');
                const colIdx = parseInt(parts[parts.length - 1]);
                const tableId = parts.slice(0, parts.length - 1).join('-');
                addNodeToNewConnection(tableId, colIdx);
                setContextMenu({ ...contextMenu, visible: false });
              }}>
                <span className="tc-context-item-icon">+</span>Start New Connection
              </div>
              <div className="tc-context-item" onClick={() => {
                const parts = contextMenu.nodeId.split('-');
                const colIdx = parseInt(parts[parts.length - 1]);
                const tableId = parts.slice(0, parts.length - 1).join('-');
                setContextMenu({ ...contextMenu, visible: false });
                handleNodeDoubleClick(tableId, colIdx, { pageX: contextMenu.x, pageY: contextMenu.y, preventDefault: () => {} });
              }}>
                <span className="tc-context-item-icon">↗</span>Add to Existing…
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Double Click Modal ── */}
      {doubleClickMenu.visible && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000,
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }} onClick={() => setDoubleClickMenu({ ...doubleClickMenu, visible: false })}>
          <div style={{
            backgroundColor: '#fff', padding: 20, borderRadius: 8,
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)', width: 320, color: '#333'
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: 10 }}>
              Connection Actions
            </h3>

            <div
              style={{ padding: 10, cursor: 'pointer', backgroundColor: '#f8f9fa', marginBottom: 10, borderRadius: 4, display: 'flex', alignItems: 'center' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e9ecef'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f8f9fa'}
              onClick={() => addNodeToNewConnection(doubleClickMenu.tableId, doubleClickMenu.colIndex)}
            >
              <span style={{ fontSize: 20, marginRight: 10 }}>➕</span>
              <div>
                <div style={{ fontWeight: 'bold' }}>Add New Connection</div>
                <div style={{ fontSize: 12, color: '#666' }}>Create C{connections.length + 1}</div>
              </div>
            </div>

            <div style={{ fontWeight: 'bold', margin: '10px 0', fontSize: 14 }}>Add to Existing:</div>

            <div style={{ maxHeight: 200, overflowY: 'auto' }}>
              {connections.length === 0 && (
                <div style={{ fontStyle: 'italic', color: '#999', fontSize: 12 }}>No existing connections</div>
              )}
              {connections.map(conn => (
                <div
                  key={conn.id}
                  style={{ padding: 8, cursor: 'pointer', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f1f1f1'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  onClick={() => addNodeToConnection(conn.id, doubleClickMenu.tableId, doubleClickMenu.colIndex)}
                >
                  <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: conn.color, marginRight: 10, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{conn.id}</div>
                    <div style={{ fontSize: 11, color: '#666' }}>
                      {conn.nodes.length} nodes{conn.instructions ? ` · "${conn.instructions}"` : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 15, textAlign: 'right' }}>
              <button
                onClick={() => setDoubleClickMenu({ ...doubleClickMenu, visible: false })}
                style={{ padding: '5px 12px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
