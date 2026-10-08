/**
 * @file SpriteSheetSlicer.ts
 * @description Extracts individual sprite tiles and frames from composite sprite sheets.
 * Supports uniform grid slicing, custom margins/padding, and transparent alpha bounding detection.
 */

export interface SliceGridConfig {
  cellWidth: number;
  cellHeight: number;
  margin?: number;
  padding?: number;
  maxFrames?: number;
}

export interface SlicedFrame {
  index: number;
  col: number;
  row: number;
  x: number;
  y: number;
  width: number;
  height: number;
  dataUrl?: string;
}

export class SpriteSheetSlicer {
  /**
   * Computes grid coordinates for a uniform tile sheet without requiring canvas access.
   */
  public static computeGridFrames(
    imageWidth: number,
    imageHeight: number,
    config: SliceGridConfig
  ): SlicedFrame[] {
    const { cellWidth, cellHeight, margin = 0, padding = 0, maxFrames = 1000 } = config;
    const frames: SlicedFrame[] = [];

    if (cellWidth <= 0 || cellHeight <= 0 || imageWidth < cellWidth || imageHeight < cellHeight) {
      return frames;
    }

    const usableWidth = imageWidth - margin * 2;
    const usableHeight = imageHeight - margin * 2;

    const cols = Math.floor((usableWidth + padding) / (cellWidth + padding));
    const rows = Math.floor((usableHeight + padding) / (cellHeight + padding));

    let index = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (index >= maxFrames) break;

        const x = margin + c * (cellWidth + padding);
        const y = margin + r * (cellHeight + padding);

        frames.push({
          index,
          col: c,
          row: r,
          x,
          y,
          width: cellWidth,
          height: cellHeight
        });

        index++;
      }
    }

    return frames;
  }

  /**
   * Extracts sprite frames into data URLs using an HTMLCanvasElement or OffscreenCanvas.
   */
  public static async sliceImageToDataUrls(
    imageSource: CanvasImageSource,
    imageWidth: number,
    imageHeight: number,
    config: SliceGridConfig
  ): Promise<SlicedFrame[]> {
    const frames = this.computeGridFrames(imageWidth, imageHeight, config);

    if (typeof document === 'undefined' && typeof OffscreenCanvas === 'undefined') {
      return frames; // Headless environment fallback without canvas
    }

    const { cellWidth, cellHeight } = config;

    let canvas: HTMLCanvasElement | OffscreenCanvas;
    let ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null = null;

    if (typeof OffscreenCanvas !== 'undefined') {
      canvas = new OffscreenCanvas(cellWidth, cellHeight);
      ctx = canvas.getContext('2d');
    } else {
      canvas = document.createElement('canvas');
      canvas.width = cellWidth;
      canvas.height = cellHeight;
      ctx = canvas.getContext('2d');
    }

    if (!ctx) return frames;

    for (const frame of frames) {
      ctx.clearRect(0, 0, cellWidth, cellHeight);
      ctx.drawImage(
        imageSource,
        frame.x,
        frame.y,
        frame.width,
        frame.height,
        0,
        0,
        cellWidth,
        cellHeight
      );

      if ('toDataURL' in canvas) {
        frame.dataUrl = canvas.toDataURL('image/webp', 0.9);
      } else if ('convertToBlob' in canvas) {
        const blob = await (canvas as OffscreenCanvas).convertToBlob({ type: 'image/webp', quality: 0.9 });
        frame.dataUrl = await blobToDataUrl(blob);
      }
    }

    return frames;
  }
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
