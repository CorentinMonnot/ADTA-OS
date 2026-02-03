import { NODE_OFFSET_X, NODE_OFFSET_Y } from './data/nodes';

const INITIAL_SCREEN_X = 30;
const INITIAL_SCREEN_Y = 150;

export function getCanvasBounds(nodesList) {
  if (nodesList.length === 0) return { minX: 0, minY: 0 };

  const minX = Math.min(...nodesList.map(n => n.x + NODE_OFFSET_X));
  const minY = Math.min(...nodesList.map(n => n.y + NODE_OFFSET_Y));

  return { minX, minY };
}

export function getDefaultPan(nodesList, zoom = 1) {
  const { minX, minY } = getCanvasBounds(nodesList);
  // Account for zoom: screenPos = nodePos * zoom + pan
  // So: pan = screenPos - nodePos * zoom
  return {
    x: INITIAL_SCREEN_X - minX * zoom,
    y: INITIAL_SCREEN_Y - minY * zoom,
  };
}

export function getFitToViewport(nodesList, viewportWidth, viewportHeight, padding = { top: 130, right: 60, bottom: 60, left: 60 }) {
  if (nodesList.length === 0) return { zoom: 1, pan: { x: 0, y: 0 } };

  // Calculate bounds (node center positions + offsets for node dimensions)
  const minX = Math.min(...nodesList.map(n => n.x + NODE_OFFSET_X));
  const maxX = Math.max(...nodesList.map(n => n.x - NODE_OFFSET_X));
  const minY = Math.min(...nodesList.map(n => n.y + NODE_OFFSET_Y));
  const maxY = Math.max(...nodesList.map(n => n.y - NODE_OFFSET_Y));

  const contentWidth = maxX - minX;
  const contentHeight = maxY - minY;

  // Available space after padding
  const availableWidth = viewportWidth - padding.left - padding.right;
  const availableHeight = viewportHeight - padding.top - padding.bottom;

  // Calculate zoom to fit (cap between 0.3 and 1)
  const zoom = Math.min(
    availableWidth / contentWidth,
    availableHeight / contentHeight,
    1
  );
  const clampedZoom = Math.max(zoom, 0.3);

  // Calculate scaled content dimensions
  const scaledContentWidth = contentWidth * clampedZoom;
  const scaledContentHeight = contentHeight * clampedZoom;

  // Center content within the available space (respecting padding)
  const pan = {
    x: padding.left + (availableWidth - scaledContentWidth) / 2 - minX * clampedZoom,
    y: padding.top + (availableHeight - scaledContentHeight) / 2 - minY * clampedZoom,
  };

  return { zoom: clampedZoom, pan };
}
