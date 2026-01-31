import React, { useState } from 'react';
import { getIcon } from './icons';

export default function Node({ node, isSelected, onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  // Split label into two lines if too long
  const maxCharsPerLine = 18;
  let labelLines = [node.label];
  if (node.label.length > maxCharsPerLine) {
    const words = node.label.split(' ');
    let line1 = '';
    let line2 = '';
    for (const word of words) {
      if ((line1 + ' ' + word).trim().length <= maxCharsPerLine) {
        line1 = (line1 + ' ' + word).trim();
      } else {
        line2 = (line2 + ' ' + word).trim();
      }
    }
    labelLines = [line1, line2].filter(l => l);
  }

  return (
    <g
      transform={`translate(${node.x}, ${node.y})`}
      onClick={() => onClick(node.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ cursor: 'pointer' }}
    >
      {/* Glow effect */}
      {(isSelected || isHovered) && (
        <rect
          x="-110"
          y="-45"
          width="220"
          height="90"
          rx="8"
          fill={node.color}
          opacity="0.15"
          style={{
            filter: 'blur(15px)',
          }}
        />
      )}

      {/* Node background */}
      <rect
        x="-100"
        y="-40"
        width="200"
        height="80"
        rx="6"
        fill="#1a1a2e"
        stroke={isSelected ? node.color : isHovered ? node.color : '#2d2d44'}
        strokeWidth={isSelected ? 2 : 1}
        style={{
          transition: 'all 0.2s ease',
        }}
      />

      {/* Color accent bar */}
      <rect
        x="-100"
        y="-40"
        width="6"
        height="80"
        rx="6"
        fill={node.color}
        clipPath="inset(0 0 0 0 round 6px 0 0 6px)"
      />
      <rect
        x="-100"
        y="-40"
        width="6"
        height="80"
        fill={node.color}
      />

      {/* Icon */}
      <g transform="translate(-80, -12)" fill="none" stroke="#ffffff">
        {getIcon(node.icon)}
      </g>

      {/* Label - supports 2 lines */}
      {labelLines.length === 1 ? (
        <text
          x="-45"
          y="-8"
          fill="#ffffff"
          fontSize="14"
          fontWeight="600"
          fontFamily="'JetBrains Mono', 'SF Mono', monospace"
        >
          {labelLines[0]}
        </text>
      ) : (
        <>
          <text
            x="-45"
            y="-14"
            fill="#ffffff"
            fontSize="13"
            fontWeight="600"
            fontFamily="'JetBrains Mono', 'SF Mono', monospace"
          >
            {labelLines[0]}
          </text>
          <text
            x="-45"
            y="2"
            fill="#ffffff"
            fontSize="13"
            fontWeight="600"
            fontFamily="'JetBrains Mono', 'SF Mono', monospace"
          >
            {labelLines[1]}
          </text>
        </>
      )}

      {/* Subtitle */}
      <text
        x="-45"
        y={labelLines.length === 1 ? 12 : 20}
        fill="#888899"
        fontSize="11"
        fontFamily="'JetBrains Mono', 'SF Mono', monospace"
      >
        {node.subtitle}
      </text>
    </g>
  );
}
