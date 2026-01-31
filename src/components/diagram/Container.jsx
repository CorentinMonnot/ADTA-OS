import React from 'react';

export default function Container({ container }) {
  return (
    <g>
      {/* Container background */}
      <rect
        x={container.x}
        y={container.y}
        width={container.width}
        height={container.height}
        rx="12"
        fill="#0d0d1a"
        stroke={container.color}
        strokeWidth="2"
        strokeDasharray="8 4"
        opacity="0.6"
      />

      {/* Container label background */}
      <rect
        x={container.x + 15}
        y={container.y - 12}
        width="200"
        height="24"
        rx="4"
        fill="#0d0d1a"
      />

      {/* Server icon */}
      <g transform={`translate(${container.x + 20}, ${container.y - 8})`} stroke={container.color} fill="none" strokeWidth="1.5">
        <rect x="0" y="0" width="14" height="6" rx="1" />
        <rect x="0" y="9" width="14" height="6" rx="1" />
        <circle cx="3" cy="3" r="1" fill={container.color} />
        <circle cx="3" cy="12" r="1" fill={container.color} />
      </g>

      {/* Container label */}
      <text
        x={container.x + 40}
        y={container.y + 2}
        fill={container.color}
        fontSize="12"
        fontWeight="600"
        fontFamily="'JetBrains Mono', 'SF Mono', monospace"
      >
        {container.label}
      </text>

      {/* Container subtitle */}
      <text
        x={container.x + 100}
        y={container.y + 2}
        fill="#555"
        fontSize="10"
        fontFamily="'JetBrains Mono', 'SF Mono', monospace"
      >
        {container.subtitle}
      </text>
    </g>
  );
}
