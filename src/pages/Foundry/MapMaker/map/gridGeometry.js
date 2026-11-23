/**
 * @file gridGeometry.js
 * @description Pure viewport-culled grid calculation and single-pass Konva Canvas2D
 * drawing helpers for square and flat-topped/pointy-top tactical hex grids.
 */

export function computeVisibleGridBounds(
  viewport = { x: 0, y: 0, width: 1200, height: 800, scale: 1 },
  gridSize = 50,
  marginCells = 2,
  maxRangeCells = 300
) {
  const safeScale = Math.max(0.05, Number(viewport.scale) || 1);
  const gSize = Math.max(15, Number(gridSize) || 50);
  const vpX = Number(viewport.x) || 0;
  const vpY = Number(viewport.y) || 0;
  const vpW = Math.max(100, Number(viewport.width) || 1200);
  const vpH = Math.max(100, Number(viewport.height) || 800);
  const margin = gSize * marginCells;

  const startX = (-vpX - margin) / safeScale;
  const endX = (vpW - vpX + margin) / safeScale;
  const startY = (-vpY - margin) / safeScale;
  const endY = (vpH - vpY + margin) / safeScale;

  const minCol = Math.max(-maxRangeCells, Math.floor(startX / gSize));
  const maxCol = Math.min(maxRangeCells, Math.ceil(endX / gSize));
  const minRow = Math.max(-maxRangeCells, Math.floor(startY / gSize));
  const maxRow = Math.min(maxRangeCells, Math.ceil(endY / gSize));

  return {
    gSize,
    minCol,
    maxCol,
    minRow,
    maxRow,
    minX: minCol * gSize,
    maxX: maxCol * gSize,
    minY: minRow * gSize,
    maxY: maxRow * gSize
  };
}

/**
 * Draws a viewport-culled square grid directly onto Konva's SceneContext
 * (single minor path + optional major 5-cell accent path -> 60 FPS even zoomed out).
 */
export function drawSquareGridOnCanvas(
  ctx,
  viewport,
  gridSize = 50,
  {
    minorStroke = 'rgba(255, 255, 255, 0.18)',
    majorStroke = 'rgba(34, 211, 238, 0.35)',
    minorWidth = 1,
    majorWidth = 1.5,
    scale = 1,
    boundedBox = null
  } = {}
) {
  const safeScale = Math.max(0.05, Number(scale || viewport?.scale) || 1);
  let bounds;

  if (boundedBox && boundedBox.width && boundedBox.height) {
    const gSize = Math.max(15, Number(gridSize) || 50);
    bounds = {
      gSize,
      minCol: 0,
      maxCol: Math.ceil(boundedBox.width / gSize),
      minRow: 0,
      maxRow: Math.ceil(boundedBox.height / gSize),
      minX: 0,
      maxX: boundedBox.width,
      minY: 0,
      maxY: boundedBox.height
    };
  } else {
    bounds = computeVisibleGridBounds({ ...viewport, scale: safeScale }, gridSize, 2, 300);
  }

  const { gSize, minCol, maxCol, minRow, maxRow, minX, maxX, minY, maxY } = bounds;

  // Minor grid lines (batch in single stroke path)
  ctx.beginPath();
  ctx.strokeStyle = minorStroke;
  ctx.lineWidth = minorWidth / safeScale;
  for (let c = minCol; c <= maxCol; c++) {
    if (majorStroke && Math.abs(c) % 5 === 0) continue;
    const x = c * gSize;
    ctx.moveTo(x, minY);
    ctx.lineTo(x, maxY);
  }
  for (let r = minRow; r <= maxRow; r++) {
    if (majorStroke && Math.abs(r) % 5 === 0) continue;
    const y = r * gSize;
    ctx.moveTo(minX, y);
    ctx.lineTo(maxX, y);
  }
  ctx.stroke();

  // Major 5-cell accent lines
  if (majorStroke) {
    ctx.beginPath();
    ctx.strokeStyle = majorStroke;
    ctx.lineWidth = majorWidth / safeScale;
    for (let c = minCol; c <= maxCol; c++) {
      if (Math.abs(c) % 5 !== 0) continue;
      const x = c * gSize;
      ctx.moveTo(x, minY);
      ctx.lineTo(x, maxY);
    }
    for (let r = minRow; r <= maxRow; r++) {
      if (Math.abs(r) % 5 !== 0) continue;
      const y = r * gSize;
      ctx.moveTo(minX, y);
      ctx.lineTo(maxX, y);
    }
    ctx.stroke();
  }
}

/**
 * Draws a viewport-culled hex grid in a single Canvas2D stroke call.
 */
export function drawHexGridOnCanvas(
  ctx,
  viewport,
  gridSize = 50,
  {
    stroke = 'rgba(34, 211, 238, 0.25)',
    lineWidth = 1,
    scale = 1,
    boundedBox = null
  } = {}
) {
  const safeScale = Math.max(0.05, Number(scale || viewport?.scale) || 1);
  const hexRadius = Math.max(15, Number(gridSize) || 50);
  const hexWidth = Math.sqrt(3) * hexRadius;
  const rowHeight = hexRadius * 1.5;

  let minCol;
  let maxCol;
  let minRow;
  let maxRow;

  if (boundedBox && boundedBox.width && boundedBox.height) {
    minCol = 0;
    maxCol = Math.ceil(boundedBox.width / hexWidth);
    minRow = 0;
    maxRow = Math.ceil(boundedBox.height / rowHeight);
  } else {
    const vpX = Number(viewport?.x) || 0;
    const vpY = Number(viewport?.y) || 0;
    const vpW = Math.max(100, Number(viewport?.width) || 1200);
    const vpH = Math.max(100, Number(viewport?.height) || 800);
    const marginX = hexWidth * 2;
    const marginY = hexRadius * 3;
    const startX = (-vpX - marginX) / safeScale;
    const endX = (vpW - vpX + marginX) / safeScale;
    const startY = (-vpY - marginY) / safeScale;
    const endY = (vpH - vpY + marginY) / safeScale;
    minCol = Math.max(-200, Math.floor(startX / hexWidth) - 1);
    maxCol = Math.min(200, Math.ceil(endX / hexWidth) + 1);
    minRow = Math.max(-200, Math.floor(startY / rowHeight) - 1);
    maxRow = Math.min(200, Math.ceil(endY / rowHeight) + 1);
  }

  // Precompute 6 vertices offsets for pointy-top hexagon (matches Konva RegularPolygon 6-sides default)
  const offsets = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    offsets.push([hexRadius * Math.cos(angle), hexRadius * Math.sin(angle)]);
  }

  ctx.beginPath();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lineWidth / safeScale;

  for (let r = minRow; r <= maxRow; r++) {
    const isOddRow = (((r % 2) + 2) % 2) === 1;
    const rowOffsetX = isOddRow ? hexWidth / 2 : 0;
    const cy = r * rowHeight;
    for (let c = minCol; c <= maxCol; c++) {
      const cx = c * hexWidth + rowOffsetX;
      ctx.moveTo(cx + offsets[0][0], cy + offsets[0][1]);
      for (let i = 1; i < 6; i++) {
        ctx.lineTo(cx + offsets[i][0], cy + offsets[i][1]);
      }
      ctx.closePath();
    }
  }
  ctx.stroke();
}
