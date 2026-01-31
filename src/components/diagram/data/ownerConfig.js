// Owner color configuration
export const ownerColors = {
  'Engineering': '#3B82F6',           // Blue
  'Project Management': '#F97316',     // Orange
  'Material Management': '#10B981',    // Emerald/Green
  'Sub-Contracts Management': '#8B5CF6', // Purple
  'Procurement': '#EC4899',            // Pink
  'Ops': '#06B6D4',                    // Cyan
};

// Generate a unique gradient ID from owner names (sorted for consistency)
export function getGradientId(owners) {
  const sorted = [...owners].sort();
  return `gradient-${sorted.map(o => o.replace(/\s+/g, '-').toLowerCase()).join('-')}`;
}

// Get all unique gradient combinations needed
export function getUniqueOwnerCombinations(nodes) {
  const combinations = new Set();
  nodes.forEach(node => {
    if (node.owners && node.owners.length > 1) {
      combinations.add(JSON.stringify(node.owners.sort()));
    }
  });
  return Array.from(combinations).map(c => JSON.parse(c));
}

// Get the fill value for a node (solid color or gradient reference)
export function getNodeFill(owners) {
  if (!owners || owners.length === 0) return '#888888';
  if (owners.length === 1) return ownerColors[owners[0]] || '#888888';
  return `url(#${getGradientId(owners)})`;
}

// Get the primary color for a node (first owner's color, used for strokes/glows)
export function getPrimaryColor(owners) {
  if (!owners || owners.length === 0) return '#888888';
  return ownerColors[owners[0]] || '#888888';
}
