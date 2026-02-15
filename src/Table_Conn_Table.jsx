import React, { useState } from 'react';
import Table_Conn_Node from './Table_Conn_Node';

const Table_Conn_Table = ({
  table,
  onNodeClick,
  onNodeContextMenu,
  onNodeDoubleClick,
  selectedNodes,
  connections,
  columnLabels = {}
}) => {
  const { id, name, headers, rows, rowCount } = table;
  const [isHorizontal, setIsHorizontal] = useState(true);

  return (
    <div className="tc-table-wrapper" style={{
      position: 'relative',
      margin: 12,
      display: 'inline-flex',
      flexDirection: 'column',
      minWidth: 260,
      maxWidth: 700,
      resize: 'both',
      overflow: 'auto',
    }}>
      {/* Table Header */}
      <div className="tc-table-header">
        <span className="tc-table-name" title={name}>{name}</span>
        <span className="tc-table-badge">{headers.length}c</span>
        <span className="tc-table-badge">{rowCount ?? rows.length}r</span>
        <button
          className="tc-orientation-toggle"
          title={isHorizontal ? 'Switch to vertical headers' : 'Switch to horizontal headers'}
          onClick={() => setIsHorizontal(h => !h)}
        >
          {isHorizontal ? 'H|V' : 'V|H'}
        </button>
      </div>

      {/* Grid */}
      <div className="tc-grid" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Header Row */}
        <div className={isHorizontal ? 'tc-header-row' : 'tc-header-row'} style={{
          display: 'flex',
          flexDirection: isHorizontal ? 'row' : 'row',
          borderBottom: '2px solid #d0d0d0',
          background: '#f5f6f8',
          flexShrink: 0
        }}>
          {headers.map((header, index) => {
            const nodeId = `${id}-${index}`;
            const isSelected = selectedNodes.has(nodeId);
            const connection = connections.find(c =>
              c.nodes.some(n => n.id === nodeId)
            );

            return (
              <Table_Conn_Node
                key={index}
                tableId={id}
                colIndex={index}
                colName={header}
                isSelected={isSelected}
                connection={connection}
                onToggle={onNodeClick}
                onContextMenu={onNodeContextMenu}
                onDoubleClick={onNodeDoubleClick}
                isHorizontal={isHorizontal}
                label={columnLabels[nodeId]}
              />
            );
          })}
        </div>

        {/* Data Rows */}
        <div className="tc-table-data-body">
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="tc-row">
              {row.map((cell, cellIndex) => (
                <div key={cellIndex} className="tc-cell" title={cell}>
                  {cell}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Table_Conn_Table;
