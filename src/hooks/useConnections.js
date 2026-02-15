import { useState, useCallback } from 'react';

// Helper to generate unique colors
const generateColor = (seed) => {
  const colors = [
    '#e74c3c', '#8e44ad', '#3498db', '#16a085', '#f1c40f',
    '#d35400', '#2c3e50', '#7f8c8d', '#c0392b', '#2980b9'
  ];
  return colors[seed % colors.length];
};

export default function useConnections(tables, addLog) {
  const [connections, setConnections] = useState([]);
  const [selectedNodes, setSelectedNodes] = useState(new Set());
  const [connectionCounter, setConnectionCounter] = useState(1);
  const [selectedConnectionId, setSelectedConnectionId] = useState(null);
  const [columnLabels, setColumnLabels] = useState({}); // { [nodeId]: string }

  // Context Menu State
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0, y: 0,
    connectionId: null,
    nodeId: null,
    isConnected: false
  });

  const handleNodeClick = (tableId, colIndex) => {
    const nodeId = `${tableId}-${colIndex}`;
    setSelectedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
    if (contextMenu.visible) setContextMenu({ ...contextMenu, visible: false });
  };

  const createConnection = useCallback(() => {
    if (selectedNodes.size < 2) return;

    const newConnId = `C${connectionCounter}`;
    const newNodes = Array.from(selectedNodes).map(nodeId => {
      const parts = nodeId.split('-');
      // tableId format: "table-{timestamp}-{random}", so reconstruct correctly
      const colIndex = parseInt(parts[parts.length - 1]);
      const tableId = parts.slice(0, parts.length - 1).join('-');
      const table = tables.find(t => t.id === tableId);
      const headerName = table ? table.headers[colIndex] : 'Unknown';

      return {
        id: nodeId,
        tableId,
        colIndex,
        tableName: table ? table.name : 'Unknown',
        headerName
      };
    });

    const newConnection = {
      id: newConnId,
      serial: connectionCounter,
      color: generateColor(connectionCounter),
      nodes: newNodes,
      instructions: '',
      startNode: null,
      endNode: null
    };

    setConnections(prev => [...prev, newConnection]);
    setConnectionCounter(prev => prev + 1);
    setSelectedNodes(new Set());

    const names = newNodes.map(n => `${n.tableName}(${n.headerName})`).join(', ');
    addLog(`Group Created: ${newConnId} linking [${names}]`);
  }, [selectedNodes, connectionCounter, tables, addLog]);

  // Context Menu — works for both connected and unconnected nodes
  const handleNodeContextMenu = (e, connection, nodeId) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.pageX,
      y: e.pageY,
      connectionId: connection?.id ?? null,
      nodeId: nodeId,
      isConnected: !!connection
    });
  };

  const handleSetStart = () => {
    setConnections(prev => prev.map(c =>
      c.id === contextMenu.connectionId ? { ...c, startNode: contextMenu.nodeId } : c
    ));
    setContextMenu({ ...contextMenu, visible: false });
    addLog(`Connection ${contextMenu.connectionId}: Start Node set.`);
  };

  const handleSetEnd = () => {
    setConnections(prev => prev.map(c =>
      c.id === contextMenu.connectionId ? { ...c, endNode: contextMenu.nodeId } : c
    ));
    setContextMenu({ ...contextMenu, visible: false });
    addLog(`Connection ${contextMenu.connectionId}: End Node set.`);
  };

  // New: update instruction without prompt()
  const handleUpdateInstruction = (connectionId, text) => {
    setConnections(prev => prev.map(c =>
      c.id === connectionId ? { ...c, instructions: text } : c
    ));
    addLog(`Connection ${connectionId}: Instruction updated.`);
  };

  // New: label a column with a display alias
  const handleLabelColumn = (nodeId, label) => {
    setColumnLabels(prev => ({ ...prev, [nodeId]: label }));
    addLog(`Column ${nodeId}: Label set to "${label}".`);
    setContextMenu({ ...contextMenu, visible: false });
  };

  // New: remove a specific node from one connection
  const handleRemoveFromConnection = (connId, nodeId) => {
    setConnections(prev => prev.map(conn => {
      if (conn.id !== connId) return conn;
      return { ...conn, nodes: conn.nodes.filter(n => n.id !== nodeId) };
    }));
    addLog(`Removed node ${nodeId} from ${connId}.`);
    setContextMenu({ ...contextMenu, visible: false });
  };

  // New: remove a node from ALL connections it belongs to
  const handleDisconnectNode = (nodeId) => {
    setConnections(prev => prev.map(conn => ({
      ...conn,
      nodes: conn.nodes.filter(n => n.id !== nodeId)
    })));
    addLog(`Node ${nodeId} disconnected from all connections.`);
    setContextMenu({ ...contextMenu, visible: false });
  };

  const deleteConnection = useCallback(() => {
    if (selectedConnectionId) {
      setConnections(prev => prev.filter(c => c.id !== selectedConnectionId));
      addLog(`Deleted Connection: ${selectedConnectionId}`);
      setSelectedConnectionId(null);
    }
  }, [selectedConnectionId, addLog]);

  // Double Click State
  const [doubleClickMenu, setDoubleClickMenu] = useState({
    visible: false,
    tableId: null,
    colIndex: null,
    x: 0,
    y: 0
  });

  const handleNodeDoubleClick = (tableId, colIndex, e) => {
    e.preventDefault();
    setDoubleClickMenu({
      visible: true,
      tableId,
      colIndex,
      x: e.pageX,
      y: e.pageY
    });
  };

  const addNodeToNewConnection = (tableId, colIndex) => {
    const newConnId = `C${connectionCounter}`;
    const parts = `${tableId}-${colIndex}`.split('-');
    const table = tables.find(t => t.id === tableId);
    const headerName = table ? table.headers[colIndex] : 'Unknown';

    const newNode = {
      id: `${tableId}-${colIndex}`,
      tableId,
      colIndex,
      tableName: table ? table.name : 'Unknown',
      headerName
    };

    const newConnection = {
      id: newConnId,
      serial: connectionCounter,
      color: generateColor(connectionCounter),
      nodes: [newNode],
      instructions: '',
      startNode: null,
      endNode: null
    };

    setConnections(prev => [...prev, newConnection]);
    setConnectionCounter(prev => prev + 1);
    addLog(`New Connector Head created ${newConnId}`);
    setDoubleClickMenu(prev => ({ ...prev, visible: false }));
  };

  const addNodeToConnection = (connId, tableId, colIndex) => {
    const table = tables.find(t => t.id === tableId);
    const headerName = table ? table.headers[colIndex] : 'Unknown';

    const newNode = {
      id: `${tableId}-${colIndex}`,
      tableId,
      colIndex,
      tableName: table ? table.name : 'Unknown',
      headerName
    };

    setConnections(prev => prev.map(conn => {
      if (conn.id !== connId) return conn;
      if (conn.nodes.some(n => n.id === newNode.id)) return conn;
      return { ...conn, nodes: [...conn.nodes, newNode] };
    }));

    addLog(`${connId} Connector's Tail added`);
    setDoubleClickMenu(prev => ({ ...prev, visible: false }));
  };

  return {
    connections,
    selectedNodes,
    selectedConnectionId,
    setSelectedConnectionId,
    contextMenu,
    setContextMenu,
    doubleClickMenu,
    setDoubleClickMenu,
    columnLabels,
    handleNodeClick,
    handleNodeDoubleClick,
    createConnection,
    addNodeToNewConnection,
    addNodeToConnection,
    handleNodeContextMenu,
    handleSetStart,
    handleSetEnd,
    handleUpdateInstruction,
    handleLabelColumn,
    handleRemoveFromConnection,
    handleDisconnectNode,
    deleteConnection
  };
}
