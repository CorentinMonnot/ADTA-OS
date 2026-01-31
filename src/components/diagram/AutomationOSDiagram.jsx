import React, { useState, useCallback } from 'react';
import { nodes } from './data/nodes';
import { connections } from './data/connections';
import { containers } from './data/containers';
import { getDefaultPan } from './utils';
import Container from './Container';
import Node from './Node';
import Connection from './Connection';
import DetailPanel from './DetailPanel';

export default function AutomationOSDiagram() {
  const [selectedNode, setSelectedNode] = useState(null);
  const defaultPan = getDefaultPan(nodes);
  const [pan, setPan] = useState(defaultPan);
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

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
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.min(Math.max(prev + delta, 0.3), 3));
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 0.2, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 0.2, 0.3));
  }, []);

  const handleResetView = useCallback(() => {
    setPan(defaultPan);
    setZoom(1);
  }, [defaultPan]);

  const selectedNodeData = nodes.find(n => n.id === selectedNode);

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
          Click on a node to view details • Drag to pan • Scroll to zoom
        </div>
      </div>

      {/* Zoom Controls */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
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
        width="100%"
        height="100%"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          cursor: isPanning ? 'grabbing' : 'grab'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
      >
        <style>
          {`
            @keyframes flowDash {
              to {
                stroke-dashoffset: -10;
              }
            }
          `}
        </style>

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Containers (render first, behind everything) */}
          {containers.map(container => (
            <Container key={container.id} container={container} />
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

      {/* Legend */}
      <div style={{
        position: 'absolute',
        bottom: '0',
        left: '0',
        right: '0',
        display: 'flex',
        justifyContent: 'center',
        gap: '32px',
        padding: '8px 20px',
        background: 'rgba(13, 13, 26, 0.95)',
        borderTop: '1px solid #3d3d5c',
        fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
        fontSize: '11px',
      }}>
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

      {/* Detail panel */}
      <DetailPanel
        node={selectedNodeData}
        onClose={() => setSelectedNode(null)}
      />
    </div>
  );
}
