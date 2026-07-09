/**
 * 2D Grid Renderer
 * Renders grid and objects in 2D top-down view
 * Developer-focused visualization with coordinates and tile states
 */

import { BaseRenderer } from './IRenderer';
import type {
  GridState,
  Renderable,
  GridPosition,
  WorldPosition,
  Tile,
} from '../types';
import { RendererType } from '../types';
import { tileKey } from '../types';

export class TwoDRenderer extends BaseRenderer {
  readonly type: RendererType = RendererType.TWO_D;

  private colors = {
    background: '#1a1a2e',
    gridLine: '#2a2a4e',
    gridLineHighlight: '#3a3a6e',
    tileEmpty: '#1a1a2e',
    tileOccupied: '#4a4a8e',
    tileReserved: '#6a4a4e',
    tileWalkable: '#2a4a4a',
    tileInvalid: '#8a4a4a',
    object: '#5a5a9e',
    objectSelected: '#8a8aee',
    previewValid: '#4a8a4a',
    previewInvalid: '#8a4a4a',
    text: '#ffffff',
    textDim: '#8888aa',
  };

  /**
   * Render complete grid state
   */
  renderGrid(state: GridState): void {
    if (!this.ctx || !this.context) return;

    this.clear();
    this.drawBackground();
    this.drawGridLines(state);
    this.drawTiles(state);
    this.drawObjects(state);
    this.drawCoordinates(state);
  }

  /**
   * Draw background
   */
  private drawBackground(): void {
    if (!this.ctx || !this.context) return;

    this.ctx.fillStyle = this.colors.background;
    this.ctx.fillRect(0, 0, this.context.width, this.context.height);
  }

  /**
   * Draw grid lines
   */
  private drawGridLines(state: GridState): void {
    if (!this.ctx || !this.context) return;

    const { tileSize, offsetX, offsetY } = this.context;
    const { width, height } = state;

    this.ctx.strokeStyle = this.colors.gridLine;
    this.ctx.lineWidth = 1;

    // Vertical lines
    for (let x = 0; x <= width; x++) {
      const screenX = offsetX + x * tileSize;
      this.ctx.beginPath();
      this.ctx.moveTo(screenX, offsetY);
      this.ctx.lineTo(screenX, offsetY + height * tileSize);
      this.ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= height; y++) {
      const screenY = offsetY + y * tileSize;
      this.ctx.beginPath();
      this.ctx.moveTo(offsetX, screenY);
      this.ctx.lineTo(offsetX + width * tileSize, screenY);
      this.ctx.stroke();
    }
  }

  /**
   * Draw tiles with their states
   */
  private drawTiles(state: GridState): void {
    if (!this.ctx || !this.context) return;

    const { tileSize, offsetX, offsetY } = this.context;

    for (const [key, tile] of state.tiles) {
      const screenPos = this.gridToScreen(tile.position);
      
      // Determine tile color based on state
      let fillColor = this.colors.tileEmpty;
      
      if (tile.flags.occupied) {
        fillColor = this.colors.tileOccupied;
      } else if (tile.flags.reserved) {
        fillColor = this.colors.tileReserved;
      } else if (!tile.flags.walkable) {
        fillColor = this.colors.tileInvalid;
      }

      // Draw tile background
      this.ctx.fillStyle = fillColor;
      this.ctx.globalAlpha = 0.3;
      this.ctx.fillRect(
        screenPos.x + 1,
        screenPos.y + 1,
        tileSize - 2,
        tileSize - 2
      );
      this.ctx.globalAlpha = 1.0;
    }
  }

  /**
   * Draw objects on grid
   */
  private drawObjects(state: GridState): void {
    if (!this.ctx || !this.context) return;

    const { tileSize, offsetX, offsetY } = this.context;

    for (const object of state.objects.values()) {
      const screenPos = this.gridToScreen(object.position);
      
      // Draw object placeholder
      this.ctx.fillStyle = this.colors.object;
      this.ctx.strokeStyle = this.colors.objectSelected;
      this.ctx.lineWidth = 2;

      const padding = 4;
      this.ctx.fillRect(
        screenPos.x + padding,
        screenPos.y + padding,
        tileSize - padding * 2,
        tileSize - padding * 2
      );
      this.ctx.strokeRect(
        screenPos.x + padding,
        screenPos.y + padding,
        tileSize - padding * 2,
        tileSize - padding * 2
      );

      // Draw rotation indicator
      this.drawRotationIndicator(screenPos, tileSize, object.rotation);

      // Draw object type label
      this.ctx.fillStyle = this.colors.text;
      this.ctx.font = '10px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(
        object.type,
        screenPos.x + tileSize / 2,
        screenPos.y + tileSize / 2
      );
    }
  }

  /**
   * Draw rotation indicator
   */
  private drawRotationIndicator(
    screenPos: { x: number; y: number },
    tileSize: number,
    rotation: number
  ): void {
    if (!this.ctx) return;

    const centerX = screenPos.x + tileSize / 2;
    const centerY = screenPos.y + tileSize / 2;
    const radius = tileSize / 4;

    this.ctx.strokeStyle = this.colors.text;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(centerX, centerY);
    
    const angle = (rotation * Math.PI) / 180;
    const endX = centerX + radius * Math.cos(angle - Math.PI / 2);
    const endY = centerY + radius * Math.sin(angle - Math.PI / 2);
    
    this.ctx.lineTo(endX, endY);
    this.ctx.stroke();
  }

  /**
   * Draw coordinates on grid
   */
  private drawCoordinates(state: GridState): void {
    if (!this.ctx || !this.context) return;

    const { tileSize, offsetX, offsetY } = this.context;
    const { width, height } = state;

    this.ctx.fillStyle = this.colors.textDim;
    this.ctx.font = '8px monospace';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';

    // Draw column numbers
    for (let x = 0; x < width; x++) {
      const screenX = offsetX + x * tileSize + 2;
      const screenY = offsetY + 2;
      this.ctx.fillText(x.toString(), screenX, screenY);
    }

    // Draw row numbers
    for (let y = 0; y < height; y++) {
      const screenX = offsetX + 2;
      const screenY = offsetY + y * tileSize + 2;
      this.ctx.fillText(y.toString(), screenX, screenY);
    }
  }

  /**
   * Render single object
   */
  renderObject(object: Renderable): void {
    if (!this.ctx || !this.context) return;

    const screenPos = this.gridToScreen(object.position);
    const { tileSize } = this.context;

    // Highlight selected object
    this.ctx.strokeStyle = this.colors.objectSelected;
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(
      screenPos.x,
      screenPos.y,
      tileSize,
      tileSize
    );
  }

  /**
   * Render placement preview
   */
  renderPreview(object: Renderable, valid: boolean): void {
    if (!this.ctx || !this.context) return;

    const screenPos = this.gridToScreen(object.position);
    const { tileSize } = this.context;

    // Draw preview rectangle
    this.ctx.fillStyle = valid ? this.colors.previewValid : this.colors.previewInvalid;
    this.ctx.globalAlpha = 0.5;
    this.ctx.fillRect(
      screenPos.x + 2,
      screenPos.y + 2,
      tileSize - 4,
      tileSize - 4
    );
    this.ctx.globalAlpha = 1.0;

    // Draw border
    this.ctx.strokeStyle = valid ? this.colors.previewValid : this.colors.previewInvalid;
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(
      screenPos.x + 2,
      screenPos.y + 2,
      tileSize - 4,
      tileSize - 4
    );
  }

  /**
   * Convert grid position to screen coordinates (2D)
   */
  gridToScreen(position: GridPosition): { x: number; y: number } {
    if (!this.context) {
      return { x: 0, y: 0 };
    }

    const { tileSize, offsetX, offsetY } = this.context;
    return {
      x: offsetX + position.x * tileSize,
      y: offsetY + position.y * tileSize,
    };
  }

  /**
   * Convert screen coordinates to grid position (2D)
   */
  screenToGrid(x: number, y: number): GridPosition {
    if (!this.context) {
      return { x: 0, y: 0 };
    }

    const { tileSize, offsetX, offsetY } = this.context;
    return {
      x: Math.floor((x - offsetX) / tileSize),
      y: Math.floor((y - offsetY) / tileSize),
    };
  }

  /**
   * Convert grid position to world position (2D = same as grid)
   */
  gridToWorld(position: GridPosition): WorldPosition {
    return {
      x: position.x,
      y: position.y,
      z: 0,
    };
  }

  /**
   * Convert world position to grid position (2D = same as grid)
   */
  worldToGrid(position: WorldPosition): GridPosition {
    return {
      x: Math.round(position.x),
      y: Math.round(position.y),
    };
  }

  /**
   * Update colors for theming
   */
  setColors(colors: Partial<typeof this.colors>): void {
    this.colors = { ...this.colors, ...colors };
  }
}
