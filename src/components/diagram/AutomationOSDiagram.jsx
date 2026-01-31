import React, { useState, useCallback, useRef, useMemo } from 'react';
import { nodes, ownerColors } from './data/nodes';
import { connections } from './data/connections';
import { containers } from './data/containers';
import { getDefaultPan } from './utils';
import { getGradientId, getUniqueOwnerCombinations } from './data/ownerConfig';
import Container from './Container';
import Node from './Node';
import Connection from './Connection';
import DetailPanel from './DetailPanel';

const INITIAL_ZOOM = 0.8;

export default function AutomationOSDiagram() {
  const [selectedNode, setSelectedNode] = useState(null);
  const defaultPan = getDefaultPan(nodes, INITIAL_ZOOM);
  const [pan, setPan] = useState(defaultPan);
  const [zoom, setZoom] = useState(INITIAL_ZOOM);
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const lastTouchDistance = useRef(null);
  const lastPinchCenter = useRef(null);
  const svgRef = useRef(null);

  const handleNodeClick = useCallback((nodeId) => {
    setSelectedNode(prev => prev === nodeId ? null : nodeId);
  }, []);

  const handleMouseDown = useCallback((e) => {
    if (e.target.tagName === 'svg' || e.target.tagName === 'rect' && e.target.getAttribute('fill') === 'url(#grid)') {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [pan]);

  const handleMouseMove = useCallback((e) => {
    if (isPanning) {
      setPan({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y
      });
    }
  }, [isPanning, startPan]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const rect = svgRef.current.getBoundingClientRect();
    const pointerX = e.clientX - rect.left;
    const pointerY = e.clientY - rect.top;

    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.min(Math.max(zoom * zoomFactor, 0.3), 3);
    const scale = newZoom / zoom;

    // Adjust pan so the point under the cursor stays in place
    const newPanX = pointerX - (pointerX - pan.x) * scale;
    const newPanY = pointerY - (pointerY - pan.y) * scale;

    setPan({ x: newPanX, y: newPanY });
    setZoom(newZoom);
  }, [zoom, pan]);

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 0.2, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 0.2, 0.3));
  }, []);

  const handleResetView = useCallback(() => {
    setPan(defaultPan);
    setZoom(INITIAL_ZOOM);
  }, [defaultPan]);

  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 1) {
      setIsPanning(true);
      setStartPan({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y
      });
    } else if (e.touches.length === 2) {
      const rect = svgRef.current.getBoundingClientRect();
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      lastTouchDistance.current = distance;
      // Store the pinch center relative to the SVG
      lastPinchCenter.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top
      };
    }
  }, [pan]);

  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
    if (e.touches.length === 1 && isPanning) {
      setPan({
        x: e.touches[0].clientX - startPan.x,
        y: e.touches[0].clientY - startPan.y
      });
    } else if (e.touches.length === 2 && lastTouchDistance.current && lastPinchCenter.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );

      // Calculate the current pinch center
      const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
      const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;

      // Calculate the zoom scale
      const scale = distance / lastTouchDistance.current;
      const newZoom = Math.min(Math.max(zoom * scale, 0.3), 3);
      const actualScale = newZoom / zoom;

      // Adjust pan so the pinch center stays in place, and account for finger movement
      const newPanX = centerX - (lastPinchCenter.current.x - pan.x) * actualScale;
      const newPanY = centerY - (lastPinchCenter.current.y - pan.y) * actualScale;

      setPan({ x: newPanX, y: newPanY });
      setZoom(newZoom);
      lastTouchDistance.current = distance;
      lastPinchCenter.current = { x: centerX, y: centerY };
    }
  }, [isPanning, startPan, zoom, pan]);

  const handleTouchEnd = useCallback(() => {
    setIsPanning(false);
    lastTouchDistance.current = null;
    lastPinchCenter.current = null;
  }, []);

  const selectedNodeData = nodes.find(n => n.id === selectedNode);

  // Calculate screen position for the detail panel
  const selectedNodePosition = useMemo(() => {
    if (!selectedNodeData) return null;
    return {
      x: selectedNodeData.x * zoom + pan.x,
      y: selectedNodeData.y * zoom + pan.y,
      width: 220 * zoom,
      height: 80 * zoom
    };
  }, [selectedNodeData, zoom, pan]);

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      background: 'linear-gradient(180deg, #0d0d1a 0%, #0a0a14 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background grid */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0.3,
        }}
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1a1a2e" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Title */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
        zIndex: 20,
        pointerEvents: 'none',
      }}>
        <div style={{
          fontSize: '10px',
          color: '#00D4AA',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          marginBottom: '4px',
        }}>
          Impact Automation
        </div>
        <div style={{
          fontSize: '24px',
          color: '#ffffff',
          fontWeight: '700',
        }}>
          ADTA Operating System Architecture
        </div>
        <div style={{
          fontSize: '12px',
          color: '#666',
          marginTop: '8px',
        }}>
          Click or tap a node to view details • Drag to pan • Scroll or pinch to zoom
        </div>
      </div>

      {/* Zoom Controls */}
      <div style={{
        position: 'absolute',
        bottom: '40px',
        left: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
        zIndex: 10,
      }}>
        <button
          onClick={handleZoomIn}
          style={{
            width: '36px',
            height: '36px',
            background: '#1a1a2e',
            border: '1px solid #3d3d5c',
            borderRadius: '6px',
            color: '#fff',
            fontSize: '18px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          +
        </button>
        <div style={{
          textAlign: 'center',
          color: '#666',
          fontSize: '10px',
        }}>
          {Math.round(zoom * 100)}%
        </div>
        <button
          onClick={handleZoomOut}
          style={{
            width: '36px',
            height: '36px',
            background: '#1a1a2e',
            border: '1px solid #3d3d5c',
            borderRadius: '6px',
            color: '#fff',
            fontSize: '18px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          −
        </button>
        <button
          onClick={handleResetView}
          style={{
            width: '36px',
            height: '36px',
            background: '#1a1a2e',
            border: '1px solid #3d3d5c',
            borderRadius: '6px',
            color: '#666',
            fontSize: '10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '4px',
          }}
        >
          ⟲
        </button>
      </div>

      {/* Main diagram */}
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          cursor: isPanning ? 'grabbing' : 'grab',
          touchAction: 'none'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <style>
          {`
            @keyframes flowDash {
              to {
                stroke-dashoffset: -10;
              }
            }
            @keyframes flowDashBidirectional {
              0%, 100% {
                stroke-dashoffset: -20;
              }
              50% {
                stroke-dashoffset: 20;
              }
            }
          `}
        </style>

        {/* Gradient definitions for multi-owner nodes */}
        <defs>
          {getUniqueOwnerCombinations(nodes).map(owners => {
            const gradientId = getGradientId(owners);
            const colors = owners.map(o => ownerColors[o]);
            return (
              <linearGradient key={gradientId} id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                {colors.map((color, i) => (
                  <stop
                    key={i}
                    offset={`${(i / (colors.length - 1)) * 100}%`}
                    stopColor={color}
                  />
                ))}
              </linearGradient>
            );
          })}
        </defs>

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Containers (render first, behind everything) */}
          {containers.map(container => (
            <Container key={container.id} container={container} nodes={nodes} />
          ))}

          {/* Connections */}
          {connections.map((conn, i) => (
            <Connection
              key={i}
              from={conn.from}
              to={conn.to}
              label={conn.label}
              fromSide={conn.fromSide}
              toSide={conn.toSide}
              nodes={nodes}
              bidirectional={conn.bidirectional}
            />
          ))}

          {/* Nodes */}
          {nodes.map(node => (
            <Node
              key={node.id}
              node={node}
              isSelected={selectedNode === node.id}
              onClick={handleNodeClick}
            />
          ))}
        </g>
      </svg>

      {/* Legends - Bottom Right */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        background: 'rgba(13, 13, 26, 0.95)',
        border: '1px solid #3d3d5c',
        borderRadius: '8px',
        padding: '12px 16px',
        fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
        fontSize: '11px',
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}>
        {/* Owners Legend */}
        <div>
          <div style={{ color: '#666', marginBottom: '8px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Stakeholders:</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {Object.entries(ownerColors).map(([owner, color]) => (
              <div key={owner} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '2px',
                  backgroundColor: color,
                }} />
                <span style={{ color: '#aaa' }}>{owner}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Link Type Legend */}
        <div>
          <div style={{ color: '#666', marginBottom: '8px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Link type:</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="24" height="2">
                <line x1="0" y1="1" x2="24" y2="1" stroke="#06D6A0" strokeWidth="2" strokeDasharray="6 4" />
              </svg>
              <span style={{ color: '#06D6A0' }}>Power Query</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="24" height="2">
                <line x1="0" y1="1" x2="24" y2="1" stroke="#FF6B9D" strokeWidth="2" strokeDasharray="3 3" />
              </svg>
              <span style={{ color: '#FF6B9D' }}>Manual</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="24" height="2">
                <line x1="0" y1="1" x2="24" y2="1" stroke="#FFD60A" strokeWidth="2" strokeDasharray="6 4" />
              </svg>
              <span style={{ color: '#FFD60A' }}>Reference</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="24" height="2">
                <line x1="0" y1="1" x2="24" y2="1" stroke="#8888aa" strokeWidth="2" strokeDasharray="6 4" />
              </svg>
              <span style={{ color: '#8888aa' }}>VBA Generate</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="24" height="2">
                <line x1="0" y1="1" x2="24" y2="1" stroke="#E63946" strokeWidth="2" strokeDasharray="6 4" />
              </svg>
              <span style={{ color: '#E63946' }}>Recursive Read</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="24" height="2">
                <line x1="0" y1="1" x2="24" y2="1" stroke="#F4A261" strokeWidth="2" strokeDasharray="6 4" />
              </svg>
              <span style={{ color: '#F4A261' }}>Email + Quote</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detail panel */}
      <DetailPanel
        node={selectedNodeData}
        position={selectedNodePosition}
        onClose={() => setSelectedNode(null)}
      />
    </div>
  );
}
