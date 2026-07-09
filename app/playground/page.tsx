'use client';

/**
 * Vertical Slice Gameplay Page
 * 15-minute gameplay experience
 */

import { useEffect, useRef, useState } from 'react';
import { GameplayEngine } from '@/lib/gameplay/GameplayEngine';
import { HardwareManager } from '@/lib/hardware/HardwareManager';
import TutorialOverlay from '@/components/gameplay/TutorialOverlay';
import ObjectivesPanel from '@/components/gameplay/ObjectivesPanel';
import EconomyDisplay from '@/components/gameplay/EconomyDisplay';
import RoomView from '@/components/gameplay/RoomView';

export default function PlaygroundPage() {
  const engineRef = useRef<GameplayEngine | null>(null);
  const hardwareManagerRef = useRef<HardwareManager | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);

  useEffect(() => {
    if (!hardwareManagerRef.current) {
      hardwareManagerRef.current = new HardwareManager();
    }

    if (!engineRef.current && hardwareManagerRef.current) {
      engineRef.current = new GameplayEngine(hardwareManagerRef.current);
      setIsInitialized(true);
    }

    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
      }
    };
  }, []);

  const handleStartGame = () => {
    if (!engineRef.current) return;

    const empireId = engineRef.current.startNewGame('player_1', 'My Empire');
    setIsGameStarted(true);
  };

  const handlePlaceHardware = (hardwareType: string, position: { x: number; y: number }) => {
    if (!engineRef.current) return;
    engineRef.current.placeHardware(hardwareType, position);
  };

  const handlePurchaseHardware = (hardwareType: string) => {
    if (!engineRef.current) return;
    engineRef.current.purchaseHardware(hardwareType);
  };

  const handleExpandRoom = () => {
    if (!engineRef.current) return;
    engineRef.current.expandRoom({ width: 5, height: 5 });
  };

  const handleStartSimulation = () => {
    if (!engineRef.current) return;
    const success = engineRef.current.startSimulation();
    if (success) {
      setIsSimulationRunning(true);
    }
  };

  const handleStopSimulation = () => {
    if (!engineRef.current) return;
    const success = engineRef.current.stopSimulation();
    if (success) {
      setIsSimulationRunning(false);
    }
  };

  const handleReset = () => {
    if (!engineRef.current) return;
    engineRef.current.destroy();
    engineRef.current = new GameplayEngine(hardwareManagerRef.current!);
    setIsGameStarted(false);
    setIsSimulationRunning(false);
  };

  if (!isInitialized || !engineRef.current) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="text-xl">Initializing gameplay engine...</div>
      </div>
    );
  }

  const empire = engineRef.current.getCurrentEmpire();
  const empireId = empire?.id || null;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <TutorialOverlay tutorialSystem={engineRef.current.getTutorialSystem()} />

      {!isGameStarted ? (
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
          <h1 className="text-4xl font-bold mb-8">FreeCoin Empire</h1>
          <p className="text-xl text-gray-300 mb-8">Build your mining empire from scratch</p>
          <button
            onClick={handleStartGame}
            className="px-8 py-4 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xl font-semibold"
          >
            Start New Game
          </button>
        </div>
      ) : (
        <div className="max-w7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">FreeCoin Empire</h1>
            <div className="flex gap-4">
              <button
                onClick={isSimulationRunning ? handleStopSimulation : handleStartSimulation}
                className={`px-4 py-2 rounded font-semibold ${
                  isSimulationRunning
                    ? 'bg-red-600 hover:bg-red-500'
                    : 'bg-green-600 hover:bg-green-500'
                }`}
              >
                {isSimulationRunning ? 'Stop Simulation' : 'Start Simulation'}
              </button>
              <button
                onClick={handleExpandRoom}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded font-semibold"
              >
                Expand Room
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded font-semibold"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Room View */}
            <div className="lg:col-span-2">
              <RoomView
                roomSystem={engineRef.current.getRoomSystem()}
                empireSystem={engineRef.current.getEmpireSystem()}
                hardwareManager={engineRef.current.getHardwareManager()}
                empireId={empireId}
                onPlaceHardware={handlePlaceHardware}
              />
            </div>

            {/* Right Column - Panels */}
            <div className="space-y-6">
              <ObjectivesPanel objectiveSystem={engineRef.current.getObjectiveSystem()} />
              <EconomyDisplay
                economySystem={engineRef.current.getEconomySystem()}
                empireSystem={engineRef.current.getEmpireSystem()}
                empireId={empireId}
              />
            </div>
          </div>

          {/* Mining Stats */}
          {isSimulationRunning && (
            <div className="mt-6 bg-gray-800 border border-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-bold text-white mb-3">Mining Status</h3>
              <div className="text-gray-300">
                <p>Simulation is running...</p>
                <p>Check your FreeCoin balance to see earnings!</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
