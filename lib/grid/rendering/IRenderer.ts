/**
 * Rendering Abstraction Layer
 * Supports 2D, isometric, and 3D rendering with same game logic
 */

import type {
  RendererType,
  RenderContext,
  Renderable,
  GridState,
  ICoordinateConverter,
  GridPosition,
  WorldPosition,
} from '../types';

/**
 * Abstract base renderer class
 * All renderers must implement this interface
 */
export abstract class BaseRenderer implements ICoordinateConverter {
  protected context: RenderContext | null = null;
  protected canvas: HTMLCanvasElement | null = null;
  protected ctx: CanvasRenderingContext2D | null = null;

  abstract readonly type: RendererType;

  /**
   * Initialize renderer with canvas context
   */
  initialize(context: RenderContext): void {
    this.context = context;
    this.canvas = context.canvas;
    this.ctx = this.canvas.getContext('2d');
    
    if (!this.ctx) {
      throw new Error('Failed to get 2D context from canvas');
    }

    this.setupCanvas();
  }

  /**
   * Setup canvas for rendering
   */
  protected setupCanvas(): void {
    if (!this.canvas || !this.context) return;

    this.canvas.width = this.context.width;
    this.canvas.height = this.context.height;
  }

  /**
   * Clear canvas
   */
  protected clear(): void {
    if (!this.ctx || !this.context) return;
    this.ctx.clearRect(0, 0, this.context.width, this.context.height);
  }

  /**
   * Render complete grid state
   */
  abstract renderGrid(state: GridState): void;

  /**
   * Render single object
   */
  abstract renderObject(object: Renderable): void;

  /**
   * Render placement preview
   */
  abstract renderPreview(object: Renderable, valid: boolean): void;

  /**
   * Convert grid position to screen coordinates
   */
  abstract gridToScreen(position: GridPosition): { x: number; y: number };

  /**
   * Convert screen coordinates to grid position
   */
  abstract screenToGrid(x: number, y: number): GridPosition;

  /**
   * Convert grid position to world position (for 3D/isometric)
   */
  abstract gridToWorld(position: GridPosition): WorldPosition;

  /**
   * Convert world position to grid position (for 3D/isometric)
   */
  abstract worldToGrid(position: WorldPosition): GridPosition;

  /**
   * Cleanup renderer resources
   */
  cleanup(): void {
    this.context = null;
    this.canvas = null;
    this.ctx = null;
  }

  /**
   * Get current context
   */
  getContext(): RenderContext | null {
    return this.context;
  }
}
