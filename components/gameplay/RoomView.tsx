'use client';

/**
 * Room View
 * Displays the room grid with hardware placement
 */

import { useEffect, useState } from 'react';
import { RoomSystem } from '@/lib/gameplay/RoomSystem';
import { EmpireSystem } from '@/lib/gameplay/EmpireSystem';
import { HardwareManager } from '@/lib/hardware/HardwareManager';
import type { RoomState } from '@/lib/gameplay/types';
import type { HardwareInstance } from '@/lib/hardware/types';

interface RoomViewProps {
  roomSystem: RoomSystem;
  empireSystem: EmpireSystem;
  hardwareManager: HardwareManager;
  empireId: string | null;
  onPlaceHardware: (hardwareType: string, position: { x: number; y: number }) => void;
}

export default function RoomView({
  roomSystem,
  empireSystem,
  hardwareManager,
  empireId,
  onPlaceHardware,
}: RoomViewProps) {
  const [room, setRoom] = useState<RoomState | null>(null);
  const [hardware, setHardware] = useState<HardwareInstance[]>([]);
  const [selectedHardware, setSelectedHardware] = useState<string | null>(null);
  const [selectedTile, setSelectedTile] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!empireId) return;

    const updateRoom = () => {
      const currentRoom = roomSystem.getCurrentRoom(empireId);
      setRoom(currentRoom || null);

      if (currentRoom) {
        const instances = currentRoom.hardwareIds
          .map(id => hardwareManager.getInstance(id))
          .filter((h): h is HardwareInstance => h !== undefined);
        setHardware(instances);
      } else {
        setHardware([]);
      }
    };

    updateRoom();

    // Subscribe to room events
    roomSystem.on('room_created' as any, updateRoom);
    roomSystem.on('room_expanded' as any, updateRoom);

    return () => {
      roomSystem.off('room_created' as any, updateRoom);
      roomSystem.off('room_expanded' as any, updateRoom);
    };
  }, [roomSystem, empireId, hardwareManager]);

  const handleTileClick = (x: number, y: number) => {
    if (selectedHardware) {
      onPlaceHardware(selectedHardware, { x, y });
      setSelectedHardware(null);
    } else {
      setSelectedTile({ x, y });
    }
  };

  const getHardwareAtPosition = (x: number, y: number): HardwareInstance | undefined => {
    return hardware.find(h => h.installedPosition?.x === x && h.installedPosition?.y === y);
  };

  const getHardwareColor = (category: string): string => {
    switch (category) {
      case 'gpu':
        return 'bg-purple-600';
      case 'asic':
        return 'bg-blue-600';
      case 'battery':
        return 'bg-green-600';
      case 'solar_panel':
        return 'bg-yellow-600';
      case 'cooling_unit':
        return 'bg-cyan-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getInventory = () => {
    if (!empireId) return [];
    const empire = empireSystem.getEmpire(empireId);
    if (!empire) return [];

    return Array.from(empire.hardwareInventory.entries()).filter(([_, count]) => count > 0);
  };

  if (!room) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <h3 className="text-lg font-bold text-white mb-3">Room</h3>
        <p className="text-gray-400">No room available</p>
      </div>
    );
  }

  const inventory = getInventory();

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Room: {room.name}</h3>
        <span className="text-sm text-gray-400">
          {room.gridSize.width}x{room.gridSize.height}
        </span>
      </div>

      {/* Hardware Inventory */}
      {inventory.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-white mb-2">Inventory</h4>
          <div className="flex gap-2 flex-wrap">
            {inventory.map(([type, count]) => (
              <button
                key={type}
                onClick={() => setSelectedHardware(selectedHardware === type ? null : type)}
                className={`px-3 py-1 rounded text-sm ${
                  selectedHardware === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {type} x{count}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Room Grid */}
      <div className="grid gap-1" style={{
        gridTemplateColumns: `repeat(${room.gridSize.width}, minmax(0, 1fr))`,
      }}>
        {Array.from({ length: room.gridSize.height }).map((_, y) =>
          Array.from({ length: room.gridSize.width }).map((_, x) => {
            const hw = getHardwareAtPosition(x, y);
            return (
              <button
                key={`${x}-${y}`}
                onClick={() => handleTileClick(x, y)}
                className={`aspect-square rounded border-2 ${
                  hw
                    ? `${getHardwareColor(hw.category)} border-gray-500`
                    : selectedHardware
                    ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                    : 'bg-gray-900 border-gray-800'
                } ${selectedTile?.x === x && selectedTile?.y === y ? 'border-blue-500' : ''}`}
                title={hw ? `${hw.model} (${hw.category})` : `(${x}, ${y})`}
              >
                {hw && (
                  <div className="text-xs text-white font-semibold truncate px-1">
                    {hw.category === 'gpu' ? 'GPU' : 
                     hw.category === 'asic' ? 'ASIC' :
                     hw.category === 'battery' ? 'BAT' :
                     hw.category === 'solar_panel' ? 'SOL' :
                     hw.category === 'cooling_unit' ? 'COOL' : 'HW'}
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Selected Tile Info */}
      {selectedTile && !getHardwareAtPosition(selectedTile.x, selectedTile.y) && (
        <div className="mt-4 text-sm text-gray-400">
          Selected: ({selectedTile.x}, {selectedTile.y})
          {selectedHardware && (
            <span className="ml-2 text-blue-400">Ready to place {selectedHardware}</span>
          )}
        </div>
      )}
    </div>
  );
}
