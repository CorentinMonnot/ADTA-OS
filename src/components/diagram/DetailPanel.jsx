import React from 'react';
import { getIcon } from './icons';

export default function DetailPanel({ node, onClose }) {
  if (!node) return null;

  return (
    <div style={{
      position: 'absolute',
      right: '20px',
      top: '20px',
      width: '320px',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16162a 100%)',
      border: `1px solid ${node.color}40`,
      borderRadius: '8px',
      padding: '20px',
      fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
      boxShadow: `0 0 40px ${node.color}15`,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
        paddingBottom: '16px',
        borderBottom: '1px solid #2d2d44',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: `${node.color}20`,
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: node.color,
          }}>
            {getIcon(node.icon)}
          </div>
          <div>
            <div style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>
              {node.label}
            </div>
            <div style={{ color: '#666', fontSize: '11px' }}>
              {node.subtitle}
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

      {/* Questions section */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{
          color: node.color,
          fontSize: '10px',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          marginBottom: '10px',
        }}>
          Questions Answered
        </div>
        {node.questions.map((q, i) => (
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
            <span style={{ color: node.color }}>→</span>
            {q}
          </div>
        ))}
      </div>

      {/* Details section */}
      <div>
        <div style={{
          color: node.color,
          fontSize: '10px',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          marginBottom: '10px',
        }}>
          Details
        </div>
        {Object.entries(node.details).map(([key, value]) => (
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
  );
}
