import React, { useState, useMemo } from 'react';
import { getIcon } from './icons';
import { ownerColors } from './data/ownerConfig';

// Measure text width using canvas (cached for performance)
const measureTextWidth = (() => {
  let canvas = null;
  const cache = new Map();

  return (text, font) => {
    const key = `${font}|${text}`;
    if (cache.has(key)) return cache.get(key);

    if (!canvas) {
      canvas = document.createElement('canvas');
    }
    const ctx = canvas.getContext('2d');
    ctx.font = font;
    const width = ctx.measureText(text).width;
    cache.set(key, width);
    return width;
  };
})();

// Fit text within max width, truncating with ellipsis if needed
function fitText(text, maxWidth, font) {
  if (!text) return text;

  const width = measureTextWidth(text, font);
  if (width <= maxWidth) return text;

  // Binary search for the right length
  let low = 0;
  let high = text.length;
  const ellipsis = '…';
  const ellipsisWidth = measureTextWidth(ellipsis, font);

  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    const truncated = text.slice(0, mid);
    const truncatedWidth = measureTextWidth(truncated, font) + ellipsisWidth;

    if (truncatedWidth <= maxWidth) {
      low = mid;
    } else {
      high = mid - 1;
    }
  }

  return text.slice(0, low) + ellipsis;
}

// Split text into lines that fit within max width
function splitTextIntoLines(text, maxWidth, font, maxLines = 2) {
  if (!text) return [text];

  const width = measureTextWidth(text, font);
  if (width <= maxWidth) return [text];

  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = measureTextWidth(testLine, font);

    if (testWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        // Single word too long, truncate it
        lines.push(fitText(word, maxWidth, font));
        currentLine = '';
      }

      if (lines.length >= maxLines) {
        // Truncate remaining text on last line
        const remaining = [currentLine, ...words.slice(words.indexOf(word) + 1)].join(' ').trim();
        if (remaining) {
          lines[lines.length - 1] = fitText(
            lines[lines.length - 1] + ' ' + remaining,
            maxWidth,
            font
          );
        }
        return lines;
      }
    }
  }

  if (currentLine) {
    if (lines.length >= maxLines) {
      lines[lines.length - 1] = fitText(
        lines[lines.length - 1] + ' ' + currentLine,
        maxWidth,
        font
      );
    } else {
      lines.push(currentLine);
    }
  }

  return lines;
}

export default function Node({ node, isSelected, onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  // Available width for text (card is 220px, icon area takes ~55px, plus padding)
  // Using smaller width than clip area to account for canvas vs SVG measurement differences
  // The clip area is 160px, so 140px gives a 20px safety buffer
  const textAreaWidth = 140;
  const labelFont = '600 14px "JetBrains Mono", "SF Mono", monospace';
  const labelFontSmall = '600 13px "JetBrains Mono", "SF Mono", monospace';
  const subtitleFont = '11px "JetBrains Mono", "SF Mono", monospace';

  // Memoize text calculations
  const { labelLines, truncatedSubtitle, useSmallerFont } = useMemo(() => {
    // First try single line
    const singleLineWidth = measureTextWidth(node.label, labelFont);

    if (singleLineWidth <= textAreaWidth) {
      return {
        labelLines: [node.label],
        truncatedSubtitle: fitText(node.subtitle, textAreaWidth, subtitleFont),
        useSmallerFont: false
      };
    }

    // Need to split into lines - use smaller font
    const lines = splitTextIntoLines(node.label, textAreaWidth, labelFontSmall, 2);

    return {
      labelLines: lines,
      truncatedSubtitle: fitText(node.subtitle, textAreaWidth, subtitleFont),
      useSmallerFont: true
    };
  }, [node.label, node.subtitle]);

  // Unique clip path ID for this node
  const clipId = `text-clip-${node.id}`;

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
          x="-120"
          y="-45"
          width="240"
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
        x="-110"
        y="-40"
        width="220"
        height="80"
        rx="6"
        fill="#1a1a2e"
        stroke={isSelected ? node.color : isHovered ? node.color : '#2d2d44'}
        strokeWidth={isSelected ? 2 : 1}
        style={{
          transition: 'all 0.2s ease',
        }}
      />

      {/* Color accent bar - split by owners */}
      {node.owners && node.owners.length > 1 ? (
        // Multi-owner: render split segments
        <>
          {node.owners.map((owner, i) => {
            const segmentHeight = 80 / node.owners.length;
            const y = -40 + (i * segmentHeight);
            const isFirst = i === 0;
            const isLast = i === node.owners.length - 1;
            return (
              <rect
                key={owner}
                x="-110"
                y={y}
                width="6"
                height={segmentHeight}
                rx={isFirst || isLast ? 6 : 0}
                fill={ownerColors[owner] || '#888888'}
                style={isFirst ? { clipPath: 'inset(0 0 0 0 round 6px 0 0 0)' } : isLast ? { clipPath: 'inset(0 0 0 0 round 0 0 0 6px)' } : undefined}
              />
            );
          })}
        </>
      ) : (
        // Single owner: original behavior
        <>
          <rect
            x="-110"
            y="-40"
            width="6"
            height="80"
            rx="6"
            fill={node.color}
            clipPath="inset(0 0 0 0 round 6px 0 0 6px)"
          />
          <rect
            x="-110"
            y="-40"
            width="6"
            height="80"
            fill={node.color}
          />
        </>
      )}

      {/* Clip path for text area */}
      <defs>
        <clipPath id={clipId}>
          <rect x="-55" y="-35" width="162" height="70" />
        </clipPath>
      </defs>

      {/* Icon */}
      <g transform="translate(-90, -12)" fill="none" stroke="#ffffff">
        {getIcon(node.icon)}
      </g>

      {/* Text content with clip path to prevent overflow */}
      <g clipPath={`url(#${clipId})`}>
        {/* Label - supports 2 lines */}
        {labelLines.length === 1 ? (
          <text
            x="-55"
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
              x="-55"
              y="-14"
              fill="#ffffff"
              fontSize="13"
              fontWeight="600"
              fontFamily="'JetBrains Mono', 'SF Mono', monospace"
            >
              {labelLines[0]}
            </text>
            <text
              x="-55"
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
          x="-55"
          y={labelLines.length === 1 ? 12 : 20}
          fill="#888899"
          fontSize="11"
          fontFamily="'JetBrains Mono', 'SF Mono', monospace"
        >
          {truncatedSubtitle}
        </text>
      </g>
    </g>
  );
}
