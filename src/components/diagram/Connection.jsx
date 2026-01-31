import React from 'react';

export default function Connection({ from, to, label, fromSide, toSide, nodes, bidirectional }) {
  const fromNode = nodes.find(n => n.id === from);
  const toNode = nodes.find(n => n.id === to);

  if (!fromNode || !toNode) return null;

  const isManual = label === 'Manual';
  const isReference = label === 'Reference';
  const isStoredIn = label === 'Stored In';
  const isRecursive = label === 'Recursive Read';
  const isStartPoint = label === 'Start Point';
  const isVBAGenerate = label === 'VBA Generate';
  const isEmail = label === 'Email + Quote';
  const isManualEntry = label === 'Manual Entry';

  let strokeColor = '#06D6A0';

  if (isManual) { strokeColor = '#FF6B9D'; }
  else if (isReference) { strokeColor = '#FFD60A'; }
  else if (isStoredIn) { strokeColor = '#7B8794'; }
  else if (isRecursive) { strokeColor = '#E63946'; }
  else if (isStartPoint) { strokeColor = '#E63946'; }
  else if (isVBAGenerate) { strokeColor = '#8888aa'; }
  else if (isEmail) { strokeColor = '#F4A261'; }
  else if (isManualEntry) { strokeColor = '#FF6B9D'; }

  // Helper to get attachment point coordinates
  const getAttachmentPoint = (node, side) => {
    switch (side) {
      case 'top': return { x: node.x, y: node.y - 40 };
      case 'bottom': return { x: node.x, y: node.y + 40 };
      case 'left': return { x: node.x - 100, y: node.y };
      case 'right': return { x: node.x + 100, y: node.y };
      default: return { x: node.x, y: node.y };
    }
  };

  let startX, startY, endX, endY;

  // Use manual attachment points if provided, otherwise auto-detect
  if (fromSide && toSide) {
    const startPoint = getAttachmentPoint(fromNode, fromSide);
    const endPoint = getAttachmentPoint(toNode, toSide);
    startX = startPoint.x;
    startY = startPoint.y;
    endX = endPoint.x;
    endY = endPoint.y;
  } else {
    // Auto-detect based on relative positions
    const isHorizontal = Math.abs(toNode.x - fromNode.x) > Math.abs(toNode.y - fromNode.y);
    const isRight = toNode.x > fromNode.x;

    if (isHorizontal) {
      startX = fromNode.x + (isRight ? 100 : -100);
      startY = fromNode.y;
      endX = toNode.x + (isRight ? -100 : 100);
      endY = toNode.y;
    } else {
      startX = fromNode.x;
      startY = fromNode.y + 40;
      endX = toNode.x;
      endY = toNode.y - 40;
    }
  }

  const midX = (startX + endX) / 2;

  return (
    <g>
      {/* Connection line */}
      <path
        d={`M ${startX} ${startY}
            C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeDasharray={isManual ? "3 3" : "6 4"}
        style={{
          animation: bidirectional ? 'flowDashBidirectional 4s ease-in-out infinite' : 'flowDash 1s linear infinite',
        }}
      />
    </g>
  );
}
