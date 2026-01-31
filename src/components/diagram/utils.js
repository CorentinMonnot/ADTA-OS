import { NODE_OFFSET_X, NODE_OFFSET_Y } from './data/nodes';

const INITIAL_SCREEN_X = 30;
const INITIAL_SCREEN_Y = 110;

export function getCanvasBounds(nodesList) {
  if (nodesList.length === 0) return { minX: 0, minY: 0 };

  const minX = Math.min(...nodesList.map(n => n.x + NODE_OFFSET_X));
  const minY = Math.min(...nodesList.map(n => n.y + NODE_OFFSET_Y));

  return { minX, minY };
}

export function getDefaultPan(nodesList) {
  const { minX, minY } = getCanvasBounds(nodesList);
  return {
    x: INITIAL_SCREEN_X - minX,
    y: INITIAL_SCREEN_Y - minY,
  };
}
