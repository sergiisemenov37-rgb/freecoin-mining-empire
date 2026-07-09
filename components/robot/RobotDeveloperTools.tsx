'use client';

/**
 * Robot Developer Tools
 * Developer tool with Robot Inspector, Task Queue, Job Scheduler, and Performance Viewer
 */

import { useState, useEffect, useRef } from 'react';
import { RobotSystem } from '@/lib/robot/RobotSystem';

interface RobotDeveloperToolsProps {
  robotSystem: RobotSystem;
}

export default function RobotDeveloperTools({ robotSystem }: RobotDeveloperToolsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'robots' | 'tasks' | 'scheduler' | 'stations' | 'modules'>('robots');
  
  // Robots state
  const [robots, setRobots] = useState<any[]>([]);
  const [selectedRobot, setSelectedRobot] = useState<any>(null);
  
  // Tasks state
  const [tasks, setTasks] = useState<any[]>([]);
  
  // Scheduler state
  const [taskStats, setTaskStats] = useState<any>(null);
  
  // Stations state
  const [stations, setStations] = useState<any[]>([]);
  
  // Modules state
  const [modules, setModules] = useState<any[]>([]);

  const refreshInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const refresh = () => {
      setRobots(robotSystem.getAllRobots());
      setTasks(robotSystem.getAllTasks());
      setTaskStats(robotSystem.getTaskStatistics());
      setStations(robotSystem.getAllChargingStations());
      setModules(robotSystem.getAllModules());
    };

    refresh();
    refreshInterval.current = setInterval(refresh, 500);

    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, [robotSystem]);

  const handleSelectRobot = (robot: any) => {
    setSelectedRobot(robot);
  };

  const handleCreateRobot = () => {
    robotSystem.createRobot(
      'worker' as any,
      `Worker ${robots.length + 1}`,
      { x: 0, y: 0 }
    );
  };

  const handleUpgradeRobot = () => {
    if (selectedRobot) {
      robotSystem.upgradeRobot(selectedRobot.id);
    }
  };

  const handleCreateTask = () => {
    robotSystem.createTask(
      'transport',
      2 as any,
      { source: 'warehouse', destination: 'factory' }
    );
  };

  const handleAddStation = () => {
    const stationId = `station_${Date.now()}`;
    robotSystem.addChargingStation({
      id: stationId,
      name: `Charging Station ${stations.length + 1}`,
      position: { x: Math.random() * 100, y: Math.random() * 100 },
      maxRobots: 5,
      currentRobots: 0,
      chargingSpeed: 100,
      chargingEfficiency: 0.9,
      powerConsumption: 500,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  };

  const handleAddModule = () => {
    if (selectedRobot && modules.length > 0) {
      robotSystem.addModuleToRobot(selectedRobot.id, modules[0].id);
    }
  };

  const getRobotStateColor = (state: string) => {
    switch (state) {
      case 'idle': return 'bg-green-500';
      case 'moving': return 'bg-yellow-500';
      case 'working': return 'bg-blue-500';
      case 'charging': return 'bg-purple-500';
      case 'maintenance': return 'bg-orange-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTaskPriorityColor = (priority: number) => {
    switch (priority) {
      case 0: return 'bg-red-500';
      case 1: return 'bg-orange-500';
      case 2: return 'bg-yellow-500';
      case 3: return 'bg-green-500';
      case 4: return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold z-50"
      >
        Robot Tools
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Robot Developer Tools</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('robots')}
            className={`px-4 py-2 text-sm font-semibold ${
              activeTab === 'robots' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Robots
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-2 text-sm font-semibold ${
              activeTab === 'tasks' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Tasks
          </button>
          <button
            onClick={() => setActiveTab('scheduler')}
            className={`px-4 py-2 text-sm font-semibold ${
              activeTab === 'scheduler' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Scheduler
          </button>
          <button
            onClick={() => setActiveTab('stations')}
            className={`px-4 py-2 text-sm font-semibold ${
              activeTab === 'stations' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Stations
          </button>
          <button
            onClick={() => setActiveTab('modules')}
            className={`px-4 py-2 text-sm font-semibold ${
              activeTab === 'modules' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Modules
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[70vh]">
          {activeTab === 'robots' && (
            <div className="space-y-4">
              <div className="flex gap-2 mb-4">
                <button
                  onClick={handleCreateRobot}
                  className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded font-semibold"
                >
                  + New Robot
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800 rounded p-4">
                  <h3 className="text-lg font-bold text-white mb-3">Robots ({robots.length})</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {robots.length === 0 ? (
                      <div className="text-gray-400 text-center py-4">No robots</div>
                    ) : (
                      robots.map((robot) => (
                        <div
                          key={robot.id}
                          onClick={() => handleSelectRobot(robot)}
                          className={`p-3 rounded cursor-pointer ${
                            selectedRobot?.id === robot.id ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-semibold">{robot.name}</span>
                            <span className={`w-3 h-3 rounded-full ${getRobotStateColor(robot.state)}`} />
                          </div>
                          <div className="text-gray-400 text-sm">Level {robot.level}</div>
                          <div className="text-gray-400 text-xs">
                            Battery: {((robot.currentBattery / robot.batteryCapacity) * 100).toFixed(0)}%
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {selectedRobot && (
                  <div className="bg-gray-800 rounded p-4">
                    <h3 className="text-lg font-bold text-white mb-3">Robot Details</h3>
                    <div className="space-y-2">
                      <div>
                        <label className="text-gray-400 text-sm">Name</label>
                        <div className="text-white">{selectedRobot.name}</div>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm">Type</label>
                        <div className="text-white">{selectedRobot.type}</div>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm">State</label>
                        <div className="text-white">{selectedRobot.state}</div>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm">Level</label>
                        <div className="text-white">{selectedRobot.level}</div>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm">Experience</label>
                        <div className="text-white">{selectedRobot.experience}</div>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm">Battery</label>
                        <div className="text-white">
                          {((selectedRobot.currentBattery / selectedRobot.batteryCapacity) * 100).toFixed(0)}%
                        </div>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm">Tasks Completed</label>
                        <div className="text-white">{selectedRobot.tasksCompleted}</div>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm">Modules</label>
                        <div className="text-white">{selectedRobot.modules.length}</div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={handleUpgradeRobot}
                          className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm font-semibold"
                        >
                          Upgrade
                        </button>
                        <button
                          onClick={handleAddModule}
                          className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded text-sm font-semibold"
                        >
                          Add Module
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <div className="flex gap-2 mb-4">
                <button
                  onClick={handleCreateTask}
                  className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded font-semibold"
                >
                  + New Task
                </button>
              </div>

              <div className="bg-gray-800 rounded p-4">
                <h3 className="text-lg font-bold text-white mb-3">Tasks ({tasks.length})</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {tasks.length === 0 ? (
                    <div className="text-gray-400 text-center py-4">No tasks</div>
                  ) : (
                    tasks.map((task) => (
                      <div key={task.id} className="p-3 bg-gray-700 rounded">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-semibold">{task.type}</span>
                          <span className={`w-3 h-3 rounded-full ${getTaskPriorityColor(task.priority)}`} />
                        </div>
                        <div className="text-gray-400 text-sm">State: {task.state}</div>
                        <div className="text-gray-400 text-sm">Priority: {task.priority}</div>
                        <div className="text-gray-400 text-xs mt-1">
                          Progress: {(task.progress * 100).toFixed(0)}%
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'scheduler' && taskStats && (
            <div className="space-y-4">
              <div className="bg-gray-800 rounded p-4">
                <h3 className="text-lg font-bold text-white mb-3">Task Statistics</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm">Total</label>
                    <div className="text-2xl font-bold text-white">{taskStats.total}</div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Pending</label>
                    <div className="text-2xl font-bold text-yellow-400">{taskStats.pending}</div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">In Progress</label>
                    <div className="text-2xl font-bold text-blue-400">{taskStats.inProgress}</div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Completed</label>
                    <div className="text-2xl font-bold text-green-400">{taskStats.completed}</div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Failed</label>
                    <div className="text-2xl font-bold text-red-400">{taskStats.failed}</div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Cancelled</label>
                    <div className="text-2xl font-bold text-gray-400">{taskStats.cancelled}</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800 rounded p-4">
                  <h3 className="text-lg font-bold text-white mb-3">By Priority</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-red-400">Critical</span>
                      <span className="text-white">{taskStats.byPriority[0]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-orange-400">High</span>
                      <span className="text-white">{taskStats.byPriority[1]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-yellow-400">Medium</span>
                      <span className="text-white">{taskStats.byPriority[2]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-400">Low</span>
                      <span className="text-white">{taskStats.byPriority[3]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Background</span>
                      <span className="text-white">{taskStats.byPriority[4]}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded p-4">
                  <h3 className="text-lg font-bold text-white mb-3">By Type</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-white">Build</span>
                      <span className="text-white">{taskStats.byType.build}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white">Upgrade</span>
                      <span className="text-white">{taskStats.byType.upgrade}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white">Repair</span>
                      <span className="text-white">{taskStats.byType.repair}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white">Transport</span>
                      <span className="text-white">{taskStats.byType.transport}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white">Clean</span>
                      <span className="text-white">{taskStats.byType.clean}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stations' && (
            <div className="space-y-4">
              <div className="flex gap-2 mb-4">
                <button
                  onClick={handleAddStation}
                  className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded font-semibold"
                >
                  + New Station
                </button>
              </div>

              <div className="bg-gray-800 rounded p-4">
                <h3 className="text-lg font-bold text-white mb-3">Charging Stations ({stations.length})</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {stations.length === 0 ? (
                    <div className="text-gray-400 text-center py-4">No stations</div>
                  ) : (
                    stations.map((station) => (
                      <div key={station.id} className="p-3 bg-gray-700 rounded">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-semibold">{station.name}</span>
                          <span className="text-gray-400 text-xs">
                            {station.currentRobots}/{station.maxRobots}
                          </span>
                        </div>
                        <div className="text-gray-400 text-sm">Speed: {station.chargingSpeed} mAh/tick</div>
                        <div className="text-gray-400 text-sm">Efficiency: {(station.chargingEfficiency * 100).toFixed(0)}%</div>
                        <div className="text-gray-400 text-sm">Power: {station.powerConsumption}W</div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-gray-800 rounded p-4">
                <h3 className="text-lg font-bold text-white mb-3">Total Capacity</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm">Total Capacity</label>
                    <div className="text-2xl font-bold text-white">
                      {stations.reduce((sum, s) => sum + s.maxRobots, 0)}
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Current Usage</label>
                    <div className="text-2xl font-bold text-blue-400">
                      {stations.reduce((sum, s) => sum + s.currentRobots, 0)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'modules' && (
            <div className="space-y-4">
              <div className="bg-gray-800 rounded p-4">
                <h3 className="text-lg font-bold text-white mb-3">Available Modules ({modules.length})</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {modules.length === 0 ? (
                    <div className="text-gray-400 text-center py-4">No modules</div>
                  ) : (
                    modules.map((module) => (
                      <div key={module.id} className="p-3 bg-gray-700 rounded">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-semibold">{module.name}</span>
                          <span className="text-gray-400 text-xs">Level {module.level}/{module.maxLevel}</span>
                        </div>
                        <div className="text-gray-400 text-sm">{module.description}</div>
                        <div className="text-gray-400 text-xs mt-1">Type: {module.type}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
