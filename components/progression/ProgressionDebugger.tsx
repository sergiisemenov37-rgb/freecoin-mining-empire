'use client';

/**
 * Progression Debugger
 * Developer tool for viewing and managing progression state
 * Allows editing XP, previewing unlock tree, and previewing next rewards
 */

import { useState, useEffect, useRef } from 'react';
import { ProgressionEngine } from '@/lib/progression/ProgressionEngine';

interface ProgressionDebuggerProps {
  progressionEngine: ProgressionEngine;
}

export default function ProgressionDebugger({ progressionEngine }: ProgressionDebuggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [currentTier, setCurrentTier] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [xpToAdd, setXpToAdd] = useState(100);
  const [currentGoal, setCurrentGoal] = useState<any>(null);
  const [unlockTree, setUnlockTree] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'unlocks' | 'rewards' | 'goals'>('overview');

  const refreshInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const refresh = () => {
      setCurrentLevel(progressionEngine.getCurrentLevel());
      setCurrentTier(progressionEngine.getCurrentTier());
      setTotalXP(progressionEngine.getExperienceEngine().getState().totalXP);
      setCurrentGoal(progressionEngine.getCurrentGoal());
      setUnlockTree(progressionEngine.getUnlockTree());
      setNotifications(progressionEngine.getNotifications());
    };

    refresh();
    refreshInterval.current = setInterval(refresh, 1000);

    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, [progressionEngine]);

  const handleAddXP = () => {
    progressionEngine.addExperience(xpToAdd, 'custom');
    setTotalXP(progressionEngine.getExperienceEngine().getState().totalXP);
    setCurrentLevel(progressionEngine.getCurrentLevel());
  };

  const handleReset = () => {
    progressionEngine.reset();
    setCurrentLevel(1);
    setCurrentTier(1);
    setTotalXP(0);
  };

  const handleSave = async () => {
    await progressionEngine.save();
    alert('Progression state saved!');
  };

  const handleLoad = async () => {
    const success = await progressionEngine.load();
    if (success) {
      alert('Progression state loaded!');
    } else {
      alert('No saved state found!');
    }
  };

  const renderUnlockTreeNode = (node: any, depth: number = 0) => {
    if (!node) return null;

    const isUnlocked = progressionEngine.getUnlockEngine().isUnlocked(node.unlock.id);
    const isVisible = progressionEngine.getUnlockEngine().isVisible(node.unlock.id);

    return (
      <div key={node.unlock.id} style={{ marginLeft: depth * 20 }}>
        <div className={`flex items-center gap-2 p-2 rounded ${
          isUnlocked ? 'bg-green-900 border-green-500' :
          isVisible ? 'bg-gray-800 border-gray-600' :
          'bg-gray-900 border-gray-800'
        } border`}>
          <span className={`w-3 h-3 rounded-full ${
            isUnlocked ? 'bg-green-500' : 'bg-gray-500'
          }`} />
          <span className="text-white text-sm">{node.unlock.name}</span>
          {!isVisible && <span className="text-gray-500 text-xs">(hidden)</span>}
        </div>
        {node.children && node.children.map((child: any) => renderUnlockTreeNode(child, depth + 1))}
      </div>
    );
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold z-50"
      >
        Progression Debugger
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Progression Debugger</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-sm font-semibold ${
              activeTab === 'overview' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('unlocks')}
            className={`px-4 py-2 text-sm font-semibold ${
              activeTab === 'unlocks' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Unlocks
          </button>
          <button
            onClick={() => setActiveTab('rewards')}
            className={`px-4 py-2 text-sm font-semibold ${
              activeTab === 'rewards' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Rewards
          </button>
          <button
            onClick={() => setActiveTab('goals')}
            className={`px-4 py-2 text-sm font-semibold ${
              activeTab === 'goals' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Goals
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="bg-gray-800 rounded p-4">
                <h3 className="text-lg font-bold text-white mb-3">Current Progress</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm">Level</label>
                    <div className="text-2xl font-bold text-white">{currentLevel}</div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Tier</label>
                    <div className="text-2xl font-bold text-white">{currentTier}</div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Total XP</label>
                    <div className="text-2xl font-bold text-white">{totalXP}</div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Notifications</label>
                    <div className="text-2xl font-bold text-white">{notifications.length}</div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded p-4">
                <h3 className="text-lg font-bold text-white mb-3">Edit XP</h3>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={xpToAdd}
                    onChange={(e) => setXpToAdd(Number(e.target.value))}
                    className="flex-1 bg-gray-700 text-white px-3 py-2 rounded"
                    placeholder="XP amount"
                  />
                  <button
                    onClick={handleAddXP}
                    className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded font-semibold"
                  >
                    Add XP
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-semibold"
                >
                  Save State
                </button>
                <button
                  onClick={handleLoad}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-semibold"
                >
                  Load State
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded font-semibold"
                >
                  Reset All
                </button>
              </div>
            </div>
          )}

          {activeTab === 'unlocks' && (
            <div className="space-y-4">
              <div className="bg-gray-800 rounded p-4">
                <h3 className="text-lg font-bold text-white mb-3">Unlock Tree</h3>
                <div className="space-y-2">
                  {unlockTree && renderUnlockTreeNode(unlockTree)}
                </div>
              </div>

              <div className="bg-gray-800 rounded p-4">
                <h3 className="text-lg font-bold text-white mb-3">All Unlocks</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {progressionEngine.getUnlockEngine().getAllUnlocks().map((unlock) => {
                    const isUnlocked = progressionEngine.getUnlockEngine().isUnlocked(unlock.id);
                    return (
                      <div key={unlock.id} className="flex items-center justify-between p-2 bg-gray-700 rounded">
                        <span className="text-white text-sm">{unlock.name}</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          isUnlocked ? 'bg-green-600' : 'bg-gray-600'
                        }`}>
                          {isUnlocked ? 'Unlocked' : 'Locked'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rewards' && (
            <div className="space-y-4">
              <div className="bg-gray-800 rounded p-4">
                <h3 className="text-lg font-bold text-white mb-3">Next Level Rewards</h3>
                <div className="space-y-2">
                  {(() => {
                    const nextLevel = currentLevel + 1;
                    const levelConfig = progressionEngine.getLevelSystem().getLevelConfig(nextLevel);
                    if (!levelConfig) return <div className="text-gray-400">Max level reached</div>;
                    return levelConfig.rewards.map((reward) => (
                      <div key={reward.id} className="p-2 bg-gray-700 rounded">
                        <span className="text-white text-sm">{reward.type}: {reward.amount || reward.itemId}</span>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              <div className="bg-gray-800 rounded p-4">
                <h3 className="text-lg font-bold text-white mb-3">Next Tier Rewards</h3>
                <div className="space-y-2">
                  {(() => {
                    const nextTier = currentTier + 1;
                    const tierConfig = progressionEngine.getTierSystem().getTierConfig(nextTier);
                    if (!tierConfig) return <div className="text-gray-400">Max tier reached</div>;
                    return tierConfig.rewards.map((reward) => (
                      <div key={reward.id} className="p-2 bg-gray-700 rounded">
                        <span className="text-white text-sm">{reward.type}: {reward.amount || reward.itemId}</span>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              <div className="bg-gray-800 rounded p-4">
                <h3 className="text-lg font-bold text-white mb-3">Reward History</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {progressionEngine.getRewardEngine().getRewardHistory().map((entry) => (
                    <div key={entry.rewardId} className="p-2 bg-gray-700 rounded">
                      <span className="text-white text-sm">{entry.rewardId} - {new Date(entry.claimedAt).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'goals' && (
            <div className="space-y-4">
              <div className="bg-gray-800 rounded p-4">
                <h3 className="text-lg font-bold text-white mb-3">Current Goal</h3>
                {currentGoal ? (
                  <div className="space-y-2">
                    <div className="text-white font-semibold">{currentGoal.title}</div>
                    <div className="text-gray-400 text-sm">{currentGoal.description}</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${currentGoal.progress}%` }}
                        />
                      </div>
                      <span className="text-gray-400 text-sm">{currentGoal.progress.toFixed(0)}%</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400">No active goal</div>
                )}
              </div>

              <div className="bg-gray-800 rounded p-4">
                <h3 className="text-lg font-bold text-white mb-3">Active Goals</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {progressionEngine.getGoalEngine().getActiveGoals().map((goal) => (
                    <div key={goal.id} className="p-2 bg-gray-700 rounded">
                      <div className="text-white text-sm font-semibold">{goal.title}</div>
                      <div className="text-gray-400 text-xs">{goal.description}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-gray-600 rounded-full h-1">
                          <div
                            className="bg-blue-500 h-1 rounded-full"
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                        <span className="text-gray-400 text-xs">{goal.progress.toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800 rounded p-4">
                <h3 className="text-lg font-bold text-white mb-3">Goal History</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {progressionEngine.getGoalEngine().getGoalHistory().map((entry) => (
                    <div key={entry.goalId} className="p-2 bg-gray-700 rounded">
                      <span className="text-white text-sm">{entry.goalId} - {new Date(entry.completedAt).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
