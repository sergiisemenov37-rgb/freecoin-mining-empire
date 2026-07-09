'use client';

/**
 * Grid Editor Component
 * Developer UI for grid placement system
 * Shows coordinates, occupied tiles, and preview
 */

import { useEffect, useRef, useState } from 'react';
import { Grid } from '@/lib/grid/Grid';
import { TwoDRenderer } from '@/lib/grid/rendering/TwoDRenderer';
import type {
  ObjectType,
  Rotation,
  PlacementRequest,
  GridPosition,
  PlacementPreview,
} from '@/lib/grid/types';
import {
  ObjectType as ObjectTypeEnum,
  RendererType,
  BaseSize as BaseSizeEnum,
  PlacementEventType,
} from '@/lib/grid/types';

export default function GridEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<Grid | null>(null);
  const rendererRef = useRef<TwoDRenderer | null>(null);
  const [selectedObject, setSelectedObject] = useState<ObjectType>(ObjectTypeEnum.GPU);
  const [selectedRotation, setSelectedRotation] = useState<Rotation>(0);
  const [preview, setPreview] = useState<PlacementPreview | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedPlacedObject, setSelectedPlacedObject] = useState<string | null>(null);

  // Initialize grid and renderer
  useEffect(() => {
    if (!canvasRef.current) return;

    // Create grid
    const grid = new Grid(BaseSizeEnum.ROOM);
    gridRef.current = grid;

    // Create renderer
    const renderer = new TwoDRenderer();
    rendererRef.current = renderer;

    // Initialize renderer with canvas
    const tileSize = 40;
    const gridWidth = grid.getDimensions().width;
    const gridHeight = grid.getDimensions().height;

    renderer.initialize({
      canvas: canvasRef.current,
      width: gridWidth * tileSize + 100,
      height: gridHeight * tileSize + 100,
      tileSize,
      offsetX: 50,
      offsetY: 50,
    });

    // Initial render
    renderer.renderGrid(grid.getState());

    // Register event listeners
    grid.on(PlacementEventType.OBJECT_PLACED, (event) => {
      console.log('Object placed:', event);
    });

    grid.on(PlacementEventType.OBJECT_MOVED, (event) => {
      console.log('Object moved:', event);
    });

    grid.on(PlacementEventType.OBJECT_REMOVED, (event) => {
      console.log('Object removed:', event);
    });

    grid.on(PlacementEventType.OBJECT_ROTATED, (event) => {
      console.log('Object rotated:', event);
    });

    return () => {
      renderer.cleanup();
    };
  }, []);

  // Handle canvas interactions
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !gridRef.current || !rendererRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const gridPos = rendererRef.current.screenToGrid(x, y);

    if (selectedPlacedObject) {
      // If object is selected, try to move it
      const success = gridRef.current.moveObject({
        objectId: selectedPlacedObject,
        newPosition: gridPos,
        newRotation: selectedRotation,
      });

      if (success) {
        setSelectedPlacedObject(null);
        render();
      }
    } else {
      // Place new object
      const request: PlacementRequest = {
        type: selectedObject,
        position: gridPos,
        rotation: selectedRotation,
        layer: 0,
        ownerId: 'dev-user',
      };

      const validation = gridRef.current.validatePlacement(request);
      if (validation.valid) {
        gridRef.current.placeObject(request);
        render();
      } else {
        console.log('Invalid placement:', validation.reason);
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !gridRef.current || !rendererRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const gridPos = rendererRef.current.screenToGrid(x, y);

    setPreview({
      active: true,
      objectType: selectedObject,
      position: gridPos,
      rotation: selectedRotation,
      layer: 0,
      valid: gridRef.current.validatePlacement({
        type: selectedObject,
        position: gridPos,
        rotation: selectedRotation,
        layer: 0,
        ownerId: 'dev-user',
      }).valid,
    });

    render();
  };

  const handleCanvasMouseLeave = () => {
    setPreview(null);
    render();
  };

  const rotateSelection = () => {
    const rotations: Rotation[] = [0, 90, 180, 270];
    const currentIndex = rotations.indexOf(selectedRotation);
    const nextIndex = (currentIndex + 1) % rotations.length;
    setSelectedRotation(rotations[nextIndex]);
  };

  const deleteSelected = () => {
    if (!selectedPlacedObject || !gridRef.current) return;

    gridRef.current.removeObject({ objectId: selectedPlacedObject });
    setSelectedPlacedObject(null);
    render();
  };

  const undo = () => {
    if (!gridRef.current) return;
    gridRef.current.undo();
    render();
  };

  const redo = () => {
    if (!gridRef.current) return;
    gridRef.current.redo();
    render();
  };

  const clearGrid = () => {
    if (!gridRef.current) return;
    const objects = gridRef.current.getAllObjects();
    for (const obj of objects) {
      gridRef.current.removeObject({ objectId: obj.id });
    }
    render();
  };

  const render = () => {
    if (!gridRef.current || !rendererRef.current) return;

    rendererRef.current.renderGrid(gridRef.current.getState());

    // Render preview if active
    if (preview && preview.active) {
      rendererRef.current.renderPreview(
        {
          objectId: 'preview',
          position: preview.position,
          rotation: preview.rotation,
          layer: preview.layer,
        },
        preview.valid
      );
    }

    // Render selected object
    if (selectedPlacedObject) {
      const obj = gridRef.current.getObject(selectedPlacedObject);
      if (obj) {
        rendererRef.current.renderObject({
          objectId: obj.id,
          position: obj.position,
          rotation: obj.rotation,
          layer: obj.layer,
        });
      }
    }
  };

  const handleObjectSelect = (objectType: ObjectType) => {
    setSelectedObject(objectType);
    setSelectedPlacedObject(null);
  };

  const handlePlacedObjectSelect = (objectId: string) => {
    setSelectedPlacedObject(objectId);
  };

  const placedObjects = gridRef.current?.getAllObjects() || [];

  return (
    <div className="flex flex-col gap-4 p-4 bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold text-white">Grid Editor (Developer)</h1>

      <div className="flex gap-4">
        {/* Canvas */}
        <div className="border border-gray-700 rounded-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMouseMove}
            onMouseLeave={handleCanvasMouseLeave}
            className="cursor-crosshair"
          />
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-4 w-64">
          {/* Object Selection */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-white font-semibold mb-2">Select Object</h2>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleObjectSelect(ObjectTypeEnum.GPU)}
                className={`px-3 py-2 rounded ${
                  selectedObject === ObjectTypeEnum.GPU
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                GPU
              </button>
              <button
                onClick={() => handleObjectSelect(ObjectTypeEnum.BATTERY)}
                className={`px-3 py-2 rounded ${
                  selectedObject === ObjectTypeEnum.BATTERY
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                Battery
              </button>
              <button
                onClick={() => handleObjectSelect(ObjectTypeEnum.SOLAR_PANEL)}
                className={`px-3 py-2 rounded ${
                  selectedObject === ObjectTypeEnum.SOLAR_PANEL
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                Solar Panel
              </button>
              <button
                onClick={() => handleObjectSelect(ObjectTypeEnum.COOLING)}
                className={`px-3 py-2 rounded ${
                  selectedObject === ObjectTypeEnum.COOLING
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                Cooling
              </button>
              <button
                onClick={() => handleObjectSelect(ObjectTypeEnum.WORKSHOP)}
                className={`px-3 py-2 rounded ${
                  selectedObject === ObjectTypeEnum.WORKSHOP
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                Workshop
              </button>
              <button
                onClick={() => handleObjectSelect(ObjectTypeEnum.DECORATION)}
                className={`px-3 py-2 rounded ${
                  selectedObject === ObjectTypeEnum.DECORATION
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                Decoration
              </button>
              <button
                onClick={() => handleObjectSelect(ObjectTypeEnum.ROBOT_STATION)}
                className={`px-3 py-2 rounded ${
                  selectedObject === ObjectTypeEnum.ROBOT_STATION
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                Robot Station
              </button>
            </div>
          </div>

          {/* Rotation */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-white font-semibold mb-2">Rotation: {selectedRotation}°</h2>
            <button
              onClick={rotateSelection}
              className="w-full px-3 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
            >
              Rotate (R)
            </button>
          </div>

          {/* Actions */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-white font-semibold mb-2">Actions</h2>
            <div className="flex flex-col gap-2">
              <button
                onClick={undo}
                disabled={!gridRef.current?.canUndo()}
                className="px-3 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 disabled:opacity-50"
              >
                Undo (Ctrl+Z)
              </button>
              <button
                onClick={redo}
                disabled={!gridRef.current?.canRedo()}
                className="px-3 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 disabled:opacity-50"
              >
                Redo (Ctrl+Y)
              </button>
              <button
                onClick={deleteSelected}
                disabled={!selectedPlacedObject}
                className="px-3 py-2 bg-red-700 text-white rounded hover:bg-red-600 disabled:opacity-50"
              >
                Delete Selected (Del)
              </button>
              <button
                onClick={clearGrid}
                className="px-3 py-2 bg-red-700 text-white rounded hover:bg-red-600"
              >
                Clear Grid
              </button>
            </div>
          </div>

          {/* Placed Objects */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-white font-semibold mb-2">
              Placed Objects ({placedObjects.length})
            </h2>
            <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
              {placedObjects.map((obj) => (
                <button
                  key={obj.id}
                  onClick={() => handlePlacedObjectSelect(obj.id)}
                  className={`px-2 py-1 text-left text-sm rounded ${
                    selectedPlacedObject === obj.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {obj.type} ({obj.position.x}, {obj.position.y})
                </button>
              ))}
              {placedObjects.length === 0 && (
                <p className="text-gray-500 text-sm">No objects placed</p>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-white font-semibold mb-2">Info</h2>
            <div className="text-gray-300 text-sm">
              <p>Click to place object</p>
              <p>Click object to select</p>
              <p>Click again to move selected</p>
              <p>R to rotate</p>
              <p>Del to delete selected</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
