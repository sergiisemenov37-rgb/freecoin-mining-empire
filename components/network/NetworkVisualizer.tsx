'use client';

/**
 * Network Visualizer
 * Developer tool for visualizing resource network graph
 * Shows flow, capacity, bottlenecks, and disconnected nodes
 */

import { useEffect, useRef, useState } from 'react';
import { ResourceNetworkEngine } from '@/lib/network/ResourceNetworkEngine';
import type { NetworkNode, NetworkConnection, ResourceType } from '@/lib/network/types';
import { ResourceType as ResourceTypeEnum } from '@/lib/network/types';

interface NetworkVisualizerProps {
  engine: ResourceNetworkEngine;
}

export default function NetworkVisualizer({ engine }: NetworkVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedResource, setSelectedResource] = useState<ResourceType>(ResourceTypeEnum.POWER);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [showFlow, setShowFlow] = useState(true);
  const [showCapacity, setShowCapacity] = useState(true);
  const [showBottlenecks, setShowBottlenecks] = useState(true);
  const [showDisconnected, setShowDisconnected] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const nodes = engine.getAllNodes();
  const connections = engine.getAllConnections();
  const flowState = engine.getFlowState(selectedResource);
  const statistics = engine.getStatistics();

  useEffect(() => {
    render();
  }, [selectedResource, showFlow, showCapacity, showBottlenecks, showDisconnected, zoom, pan, nodes, connections, flowState]);

  const render = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply zoom and pan
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Draw connections
    drawConnections(ctx);

    // Draw nodes
    drawNodes(ctx);

    ctx.restore();
  };

  const drawConnections = (ctx: CanvasRenderingContext2D) => {
    for (const connection of connections) {
      const fromNode = engine.getNode(connection.fromNodeId);
      const toNode = engine.getNode(connection.toNodeId);

      if (!fromNode || !toNode) continue;

      const fromPos = fromNode.position;
      const toPos = toNode.position;

      // Calculate flow for this connection
      const flow = connection.flows.get(selectedResource) || 0;
      const capacity = connection.capacities.get(selectedResource) || 0;
      const utilization = capacity > 0 ? flow / capacity : 0;

      // Determine color based on utilization
      let color = '#4a4a8e';
      if (showBottlenecks && utilization >= 0.9) {
        color = '#ff4a4a';
      } else if (utilization >= 0.7) {
        color = '#ffaa4a';
      } else if (showFlow && flow > 0) {
        color = '#4a8e4a';
      }

      // Draw connection line
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(fromPos.x, fromPos.y);
      ctx.lineTo(toPos.x, toPos.y);
      ctx.stroke();

      // Draw flow indicator
      if (showFlow && flow > 0) {
        const midX = (fromPos.x + toPos.x) / 2;
        const midY = (fromPos.y + toPos.y) / 2;
        
        ctx.fillStyle = color;
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${flow.toFixed(0)}`, midX, midY - 5);
      }

      // Draw capacity indicator
      if (showCapacity) {
        const midX = (fromPos.x + toPos.x) / 2;
        const midY = (fromPos.y + toPos.y) / 2;
        
        ctx.fillStyle = '#8888aa';
        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`/ ${capacity.toFixed(0)}`, midX, midY + 5);
      }
    }
  };

  const drawNodes = (ctx: CanvasRenderingContext2D) => {
    for (const node of nodes) {
      const pos = node.position;
      const flow = flowState?.flows.get(node.id);
      const isBottleneck = flowState?.bottlenecks.has(node.id);
      const isDisconnected = flowState?.disconnectedNodes.has(node.id);

      // Determine node color
      let fillColor = '#2a2a4e';
      if (selectedNode === node.id) {
        fillColor = '#6a6a9e';
      } else if (isBottleneck && showBottlenecks) {
        fillColor = '#ff4a4a';
      } else if (isDisconnected && showDisconnected) {
        fillColor = '#4a4a4a';
      } else if (node.status === 'active') {
        fillColor = '#4a8e4a';
      }

      // Draw node
      ctx.fillStyle = fillColor;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 15, 0, Math.PI * 2);
      ctx.fill();

      // Draw node border
      ctx.strokeStyle = selectedNode === node.id ? '#ffffff' : '#6a6a9e';
      ctx.lineWidth = selectedNode === node.id ? 3 : 1;
      ctx.stroke();

      // Draw node ID
      ctx.fillStyle = '#ffffff';
      ctx.font = '8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(node.id.slice(0, 4), pos.x, pos.y + 3);

      // Draw flow indicator
      if (showFlow && flow) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '8px monospace';
        ctx.fillText(`${flow.output.toFixed(0)}`, pos.x, pos.y - 20);
      }

      // Draw capacity indicator
      if (showCapacity && flow) {
        ctx.fillStyle = '#8888aa';
        ctx.font = '8px monospace';
        ctx.fillText(`/ ${flow.capacity.toFixed(0)}`, pos.x, pos.y + 25);
      }
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;

    // Find clicked node
    for (const node of nodes) {
      const dx = x - node.position.x;
      const dy = y - node.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= 15) {
        setSelectedNode(node.id);
        return;
      }
    }

    setSelectedNode(null);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;

    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  const handleCanvasWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(Math.max(0.1, Math.min(5, zoom * delta)));
  };

  const selectedNodeData = selectedNode ? engine.getNode(selectedNode) : null;

  return (
    <div className="flex flex-col gap-4 p-4 bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold text-white">Network Visualizer (Developer)</h1>

      <div className="flex gap-4">
        {/* Canvas */}
        <div className="border border-gray-700 rounded-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            onClick={handleCanvasClick}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
            onWheel={handleCanvasWheel}
            className="cursor-crosshair"
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          />
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-4 w-64">
          {/* Resource Selection */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-white font-semibold mb-2">Resource Type</h2>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setSelectedResource(ResourceTypeEnum.POWER)}
                className={`px-3 py-2 rounded ${
                  selectedResource === ResourceTypeEnum.POWER
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                Power
              </button>
              <button
                onClick={() => setSelectedResource(ResourceTypeEnum.COOLING)}
                className={`px-3 py-2 rounded ${
                  selectedResource === ResourceTypeEnum.COOLING
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                Cooling
              </button>
              <button
                onClick={() => setSelectedResource(ResourceTypeEnum.NETWORK)}
                className={`px-3 py-2 rounded ${
                  selectedResource === ResourceTypeEnum.NETWORK
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                Network
              </button>
              <button
                onClick={() => setSelectedResource(ResourceTypeEnum.MAINTENANCE)}
                className={`px-3 py-2 rounded ${
                  selectedResource === ResourceTypeEnum.MAINTENANCE
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                Maintenance
              </button>
            </div>
          </div>

          {/* Display Options */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-white font-semibold mb-2">Display Options</h2>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-gray-300">
                <input
                  type="checkbox"
                  checked={showFlow}
                  onChange={(e) => setShowFlow(e.target.checked)}
                />
                Show Flow
              </label>
              <label className="flex items-center gap-2 text-gray-300">
                <input
                  type="checkbox"
                  checked={showCapacity}
                  onChange={(e) => setShowCapacity(e.target.checked)}
                />
                Show Capacity
              </label>
              <label className="flex items-center gap-2 text-gray-300">
                <input
                  type="checkbox"
                  checked={showBottlenecks}
                  onChange={(e) => setShowBottlenecks(e.target.checked)}
                />
                Show Bottlenecks
              </label>
              <label className="flex items-center gap-2 text-gray-300">
                <input
                  type="checkbox"
                  checked={showDisconnected}
                  onChange={(e) => setShowDisconnected(e.target.checked)}
                />
                Show Disconnected
              </label>
            </div>
          </div>

          {/* Zoom Controls */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-white font-semibold mb-2">Zoom: {zoom.toFixed(2)}x</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setZoom(Math.max(0.1, zoom * 0.8))}
                className="flex-1 px-3 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
              >
                -
              </button>
              <button
                onClick={() => setZoom(1)}
                className="flex-1 px-3 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
              >
                Reset
              </button>
              <button
                onClick={() => setZoom(Math.min(5, zoom * 1.2))}
                className="flex-1 px-3 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
              >
                +
              </button>
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-white font-semibold mb-2">Statistics</h2>
            <div className="text-gray-300 text-sm space-y-1">
              <p>Nodes: {statistics.nodeCount}</p>
              <p>Connections: {statistics.connectionCount}</p>
              <p>Avg Degree: {statistics.averageDegree.toFixed(2)}</p>
              <p>Max Degree: {statistics.maxDegree}</p>
              <p>Components: {statistics.connectedComponents}</p>
              <p>Diameter: {statistics.diameter}</p>
            </div>
          </div>

          {/* Selected Node */}
          {selectedNodeData && (
            <div className="bg-gray-800 p-4 rounded-lg">
              <h2 className="text-white font-semibold mb-2">Selected Node</h2>
              <div className="text-gray-300 text-sm space-y-1">
                <p>ID: {selectedNodeData.id.slice(0, 12)}...</p>
                <p>Type: {selectedNodeData.type}</p>
                <p>Status: {selectedNodeData.status}</p>
                <p>Priority: {selectedNodeData.priority}</p>
                <p>Connections: {selectedNodeData.connections.size}</p>
                <p>Load: {selectedNodeData.load.toFixed(2)}</p>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-white font-semibold mb-2">Instructions</h2>
            <div className="text-gray-300 text-sm">
              <p>Click node to select</p>
              <p>Drag to pan</p>
              <p>Scroll to zoom</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
