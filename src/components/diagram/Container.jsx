import React from 'react';

// Node dimensions (must match Node.jsx)
const NODE_WIDTH = 220;
const NODE_HEIGHT = 80;
const CONTAINER_PADDING = 30;

export default function Container({ container, nodes }) {
  // Calculate bounds from contained nodes
  let x, y, width, height;

  if (container.contains && container.contains.length > 0 && nodes) {
    const containedNodes = nodes.filter(n => container.contains.includes(n.id));

    if (containedNodes.length > 0) {
      const minX = Math.min(...containedNodes.map(n => n.x - NODE_WIDTH / 2));
      const maxX = Math.max(...containedNodes.map(n => n.x + NODE_WIDTH / 2));
      const minY = Math.min(...containedNodes.map(n => n.y - NODE_HEIGHT / 2));
      const maxY = Math.max(...containedNodes.map(n => n.y + NODE_HEIGHT / 2));

      x = minX - CONTAINER_PADDING;
      y = minY - CONTAINER_PADDING;
      width = maxX - minX + CONTAINER_PADDING * 2;
      height = maxY - minY + CONTAINER_PADDING * 2;
    } else {
      // Fallback to manual values if no matching nodes found
      ({ x, y, width, height } = container);
    }
  } else {
    // Use manual values if no contains array
    ({ x, y, width, height } = container);
  }

  return (
    <g>
      {/* Container background */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx="12"
        fill="#0d0d1a"
        stroke={container.color}
        strokeWidth="2"
        strokeDasharray="8 4"
        opacity="0.6"
      />

      {/* Container label background */}
      <rect
        x={x + 15}
        y={y - 12}
        width="200"
        height="24"
        rx="4"
        fill="#0d0d1a"
      />

      {/* Server icon */}
      <g transform={`translate(${x + 20}, ${y - 8})`} stroke={container.color} fill="none" strokeWidth="1.5">
        <rect x="0" y="0" width="14" height="6" rx="1" />
        <rect x="0" y="9" width="14" height="6" rx="1" />
        <circle cx="3" cy="3" r="1" fill={container.color} />
        <circle cx="3" cy="12" r="1" fill={container.color} />
      </g>

      {/* Container label */}
      <text
        x={x + 40}
        y={y + 2}
        fill={container.color}
        fontSize="12"
        fontWeight="600"
        fontFamily="'JetBrains Mono', 'SF Mono', monospace"
      >
        {container.label}
      </text>

      {/* Container subtitle */}
      <text
        x={x + 100}
        y={y + 2}
        fill="#555"
        fontSize="10"
        fontFamily="'JetBrains Mono', 'SF Mono', monospace"
      >
        {container.subtitle}
      </text>
    </g>
  );
}
