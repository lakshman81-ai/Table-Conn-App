import React from 'react';

const Table_Conn_Node = ({
  tableId,
  colIndex,
  colName,
  isSelected,
  connection,
  onToggle,
  onContextMenu,
  onDoubleClick,
  isHorizontal = true,
  label
}) => {
  const nodeId = `${tableId}-${colIndex}`;

  // Determine state
  const isStart = connection && connection.startNode === nodeId;
  const isEnd = connection && connection.endNode === nodeId;

  // State class for outer cell
  let stateClass = 'tc-node-unconnected';
  if (isSelected) stateClass = 'tc-node-selected';
  else if (isStart) stateClass = 'tc-node-start';
  else if (isEnd) stateClass = 'tc-node-end';
  else if (connection) stateClass = 'tc-node-connected';

  // Circle content & style
  let circleContent = '';
  let circleStyle = {};
  if (isSelected) {
    circleStyle = { background: '#007bff', borderColor: '#0056b3' };
    circleContent = '●';
  } else if (connection) {
    circleStyle = { background: connection.color, borderColor: connection.color };
    if (isStart) {
      circleStyle.boxShadow = '0 0 5px #2ecc71';
      circleStyle.borderColor = '#2ecc71';
      circleContent = '▶';
    } else if (isEnd) {
      circleStyle.boxShadow = '0 0 5px #e74c3c';
      circleStyle.borderColor = '#e74c3c';
      circleContent = '■';
    } else {
      circleContent = connection.serial;
    }
  }

  // Circle state class
  let circleStateClass = '';
  if (isSelected) circleStateClass = 'state-selected';
  else if (connection) {
    circleStateClass = 'state-connected';
    if (isStart) circleStateClass += ' state-start';
    else if (isEnd) circleStateClass += ' state-end';
  }

  const displayLabel = label || colName;
  const orientationClass = isHorizontal ? 'tc-horizontal' : 'tc-vertical';

  return (
    <div
      className={`tc-header-cell ${orientationClass} ${stateClass}`}
      onClick={() => onToggle(tableId, colIndex)}
      onDoubleClick={(e) => onDoubleClick && onDoubleClick(tableId, colIndex, e)}
      onContextMenu={(e) => onContextMenu && onContextMenu(e, connection, nodeId)}
      id={`node-${tableId}-${colIndex}`}
      title={colName}
      style={{
        display: 'flex',
        cursor: 'pointer',
        transition: 'all 0.15s',
        flex: 1,
        minWidth: 0,
        borderRight: '1px solid #e8e8e8',
      }}
    >
      <div
        className={`tc-node-circle ${circleStateClass}`}
        style={circleStyle}
      >
        {circleContent}
      </div>
      <span
        className={`tc-node-label${label ? ' has-custom-label' : ''}`}
        style={!isHorizontal ? {
          writingMode: 'vertical-rl',
          transform: 'rotate(180deg)',
          whiteSpace: 'nowrap',
          fontSize: 12,
          flex: 1,
          textAlign: 'left',
          maxWidth: 'none'
        } : {}}
      >
        {displayLabel}
      </span>
    </div>
  );
};

export default Table_Conn_Node;
