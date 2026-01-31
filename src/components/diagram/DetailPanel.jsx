import React, { useState, useEffect, useRef } from 'react';
import { getIcon } from './icons';
import { ownerColors, getGradientId } from './data/ownerConfig';

export default function DetailPanel({ node, position, onClose }) {
  const [isVisible, setIsVisible] = useState(false);
  const [displayedNode, setDisplayedNode] = useState(null);
  const [displayedPosition, setDisplayedPosition] = useState(null);
  const timeoutRef = useRef(null);
  const prevNodeIdRef = useRef(null);

  // Handle node changes (open, close, switch)
  useEffect(() => {
    const currentNodeId = node?.id ?? null;
    const prevNodeId = prevNodeIdRef.current;

    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (currentNodeId !== prevNodeId) {
      if (node && position) {
        // New node selected - update displayed data and fade in
        setDisplayedNode(node);
        setDisplayedPosition(position);
        setIsVisible(false);
        // Small delay to ensure the DOM updates before animation
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setIsVisible(true));
        });
      } else if (!node && prevNodeId) {
        // Node deselected - fade out, then clear displayed data
        setIsVisible(false);
        timeoutRef.current = setTimeout(() => {
          setDisplayedNode(null);
          setDisplayedPosition(null);
        }, 200); // Match transition duration
      }
      prevNodeIdRef.current = currentNodeId;
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [node, position]);

  // Update position while panel is open (for pan/zoom) without triggering animation
  useEffect(() => {
    if (node && position && displayedNode && node.id === displayedNode.id) {
      setDisplayedPosition(position);
    }
  }, [position]);

  if (!displayedNode || !displayedPosition) return null;

  // Calculate panel position
  const panelWidth = 320;
  const gap = 16;

  const nodeRight = displayedPosition.x + displayedPosition.width / 2;
  const nodeLeft = displayedPosition.x - displayedPosition.width / 2;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Prefer right side, fallback to left if insufficient space
  const showOnRight = (nodeRight + gap + panelWidth + 20) < viewportWidth;

  const left = showOnRight
    ? nodeRight + gap
    : nodeLeft - gap - panelWidth;

  // Layout constraints
  const topMargin = 20;
  const legendBarHeight = 45;
  const bottomMargin = 10;
  const maxAvailableHeight = viewportHeight - topMargin - legendBarHeight - bottomMargin;

  // Determine if node is in upper or lower half of viewport
  const nodeTop = displayedPosition.y - displayedPosition.height / 2;
  const nodeBottom = displayedPosition.y + displayedPosition.height / 2;
  const viewportMiddle = viewportHeight / 2;
  const isInLowerHalf = displayedPosition.y > viewportMiddle;

  let top;
  let maxPanelHeight;

  if (isInLowerHalf) {
    // Anchor panel bottom to align with node bottom, but don't go below legend
    const maxBottom = viewportHeight - legendBarHeight - bottomMargin;
    const desiredBottom = Math.min(nodeBottom + 20, maxBottom);
    // Estimate panel height (will be constrained by maxHeight anyway)
    const estimatedPanelHeight = Math.min(400, maxAvailableHeight);
    top = Math.max(topMargin, desiredBottom - estimatedPanelHeight);
    maxPanelHeight = desiredBottom - top;
  } else {
    // Anchor panel top to align with node top
    top = Math.max(topMargin, nodeTop - 20);
    maxPanelHeight = viewportHeight - top - legendBarHeight - bottomMargin;
  }

  // Build gradient border for multi-owner nodes
  const isMultiOwner = displayedNode.owners?.length > 1;
  const sortedOwners = isMultiOwner ? [...displayedNode.owners].sort() : null;
  const gradientColors = isMultiOwner
    ? sortedOwners.map(o => ownerColors[o]).join(', ')
    : null;
  const borderColor = isMultiOwner ? null : `${displayedNode.primaryColor || displayedNode.color}40`;
  const shadowColor = displayedNode.primaryColor || displayedNode.color;

  return (
    <div
      key={displayedNode.id}
      style={{
        position: 'absolute',
        left: `${left}px`,
        top: `${top}px`,
        width: `${panelWidth}px`,
        maxHeight: `${maxPanelHeight}px`,
        display: 'flex',
        flexDirection: 'column',
        background: isMultiOwner
          ? `linear-gradient(#1a1a2e, #16162a) padding-box, linear-gradient(180deg, ${gradientColors}) border-box`
          : 'linear-gradient(135deg, #1a1a2e 0%, #16162a 100%)',
        border: isMultiOwner ? '1px solid transparent' : `1px solid ${borderColor}`,
        borderRadius: '8px',
        fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
        boxShadow: `0 0 40px ${shadowColor}15`,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(-8px)',
        transition: 'opacity 0.2s ease-out, transform 0.2s ease-out',
      }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px',
        paddingBottom: '16px',
        borderBottom: '1px solid #2d2d44',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: isMultiOwner
              ? `linear-gradient(180deg, ${sortedOwners.map(o => ownerColors[o] + '20').join(', ')})`
              : `${displayedNode.primaryColor || displayedNode.color}20`,
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isMultiOwner && (
                <defs>
                  <linearGradient id={`detail-${getGradientId(sortedOwners)}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    {sortedOwners.map((owner, i) => (
                      <stop
                        key={owner}
                        offset={`${(i / (sortedOwners.length - 1)) * 100}%`}
                        stopColor={ownerColors[owner]}
                      />
                    ))}
                  </linearGradient>
                </defs>
              )}
              <g stroke={isMultiOwner ? `url(#detail-${getGradientId(sortedOwners)})` : (displayedNode.primaryColor || displayedNode.color)}>
                {getIcon(displayedNode.icon)}
              </g>
            </svg>
          </div>
          <div>
            <div style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>
              {displayedNode.label}
            </div>
            <div style={{ color: '#666', fontSize: '11px' }}>
              {displayedNode.subtitle}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#666',
            cursor: 'pointer',
            fontSize: '18px',
            padding: '4px',
          }}
        >
          ×
        </button>
      </div>

      {/* Scrollable content area */}
      <style>{`
        .detail-panel-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .detail-panel-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .detail-panel-scroll::-webkit-scrollbar-thumb {
          background: #3d3d5c;
          border-radius: 3px;
        }
        .detail-panel-scroll::-webkit-scrollbar-thumb:hover {
          background: #4d4d6c;
        }
      `}</style>
      <div
        className="detail-panel-scroll"
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: '16px 20px 20px 20px',
        }}>
        {/* Questions section */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '10px',
            ...(isMultiOwner
              ? {
                  background: `linear-gradient(90deg, ${gradientColors})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }
              : { color: displayedNode.primaryColor || displayedNode.color }),
          }}>
            Questions Answered
          </div>
          {displayedNode.questions.map((q, i) => (
            <div
              key={i}
              style={{
                color: '#ccc',
                fontSize: '12px',
                padding: '8px 0',
                borderBottom: '1px solid #2d2d4420',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
              }}
            >
              <span style={isMultiOwner
                ? {
                    background: `linear-gradient(90deg, ${gradientColors})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }
                : { color: displayedNode.primaryColor || displayedNode.color }
              }>→</span>
              {q}
            </div>
          ))}
        </div>

        {/* Details section */}
        <div>
          <div style={{
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '10px',
            ...(isMultiOwner
              ? {
                  background: `linear-gradient(90deg, ${gradientColors})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }
              : { color: displayedNode.primaryColor || displayedNode.color }),
          }}>
            Details
          </div>
          {Object.entries(displayedNode.details).map(([key, value]) => (
            <div key={key} style={{ marginBottom: '12px' }}>
              <div style={{
                color: '#666',
                fontSize: '10px',
                textTransform: 'uppercase',
                marginBottom: '4px',
              }}>
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </div>
              <div style={{ color: '#aaa', fontSize: '12px' }}>
                {Array.isArray(value) ? value.join(' • ') : value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
