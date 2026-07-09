'use client';

/**
 * Objectives Panel
 * Displays active objectives with progress tracking
 */

import { useEffect, useState } from 'react';
import { ObjectiveSystem } from '@/lib/gameplay/ObjectiveSystem';
import type { Objective } from '@/lib/gameplay/types';
import { ObjectiveStatus } from '@/lib/gameplay/types';

interface ObjectivesPanelProps {
  objectiveSystem: ObjectiveSystem;
}

export default function ObjectivesPanel({ objectiveSystem }: ObjectivesPanelProps) {
  const [objectives, setObjectives] = useState<Objective[]>([]);

  useEffect(() => {
    const updateObjectives = () => {
      setObjectives(objectiveSystem.getActiveObjectives());
    };

    updateObjectives();

    // Subscribe to objective events
    objectiveSystem.on('objective_unlocked' as any, updateObjectives);
    objectiveSystem.on('objective_started' as any, updateObjectives);
    objectiveSystem.on('objective_progress' as any, updateObjectives);
    objectiveSystem.on('objective_completed' as any, updateObjectives);

    return () => {
      objectiveSystem.off('objective_unlocked' as any, updateObjectives);
      objectiveSystem.off('objective_started' as any, updateObjectives);
      objectiveSystem.off('objective_progress' as any, updateObjectives);
      objectiveSystem.off('objective_completed' as any, updateObjectives);
    };
  }, [objectiveSystem]);

  if (objectives.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <h3 className="text-lg font-bold text-white mb-3">Objectives</h3>
      <div className="space-y-3">
        {objectives.map((objective) => (
          <div key={objective.id} className="bg-gray-700 rounded p-3">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-white">{objective.title}</h4>
              <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                {objective.status}
              </span>
            </div>
            <p className="text-sm text-gray-300 mb-3">{objective.description}</p>
            <div className="space-y-2">
              {objective.completionConditions.map((condition) => (
                <div key={condition.id} className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${(condition.currentProgress / condition.targetProgress) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-400">
                    {condition.currentProgress}/{condition.targetProgress}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
