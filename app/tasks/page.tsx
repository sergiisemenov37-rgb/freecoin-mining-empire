'use client';

import { useEffect, useState } from 'react';
import { PageLayout } from '@/components/ui/PageLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BottomNavigation } from '@/components/ui/BottomNavigation';
import { questService } from '@/services/QuestService';
import { useSession } from '@/hooks/useSession';
import { AssetManager } from '@/lib/assets/AssetManager';

export default function Tasks() {
  const { session } = useSession();
  const [quests, setQuests] = useState<any[]>([]);
  const [questProgress, setQuestProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.player_id) return;

    const loadQuests = async () => {
      try {
        setLoading(true);
        const [allQuests, progress] = await Promise.all([
          questService.getActiveQuests(),
          questService.getQuestProgressWithDetails(session.player_id),
        ]);

        setQuests(allQuests || []);
        setQuestProgress(progress || []);
      } catch (error) {
        console.error('Failed to load quests:', error);
      } finally {
        setLoading(false);
      }
    };

    loadQuests();
  }, [session?.player_id]);

  const getQuestStatus = (questId: string) => {
    const progress = questProgress.find(p => p.quest_id === questId);
    if (!progress) return 'not_started';
    if (progress.completed_at) return 'completed';
    if (progress.started_at) return 'in_progress';
    return 'not_started';
  };

  const getProgressPercent = (questId: string) => {
    const progress = questProgress.find(p => p.quest_id === questId);
    if (!progress) return 0;
    return Math.min(100, (progress.progress / progress.target) * 100);
  };

  if (loading) {
    return (
      <>
        <PageLayout title="Tasks">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-400">Loading tasks...</div>
          </div>
        </PageLayout>
        <BottomNavigation />
      </>
    );
  }

  return (
    <>
      <PageLayout title="Tasks">
        <div className="space-y-4">
          {quests.map((quest) => {
            const status = getQuestStatus(quest.id);
            const progressPercent = getProgressPercent(quest.id);

            return (
              <Card key={quest.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-white font-medium mb-1">{quest.name}</h3>
                      <p className="text-gray-400 text-sm">{quest.description}</p>
                    </div>
                    <div className="ml-3 text-right flex items-center gap-2">
                      <img src={AssetManager.resources.FREECOIN} alt="Coins" className="w-6 h-6" />
                      <div>
                        <div className="text-yellow-400 font-bold">{quest.reward}</div>
                        <div className="text-gray-400 text-xs">coins</div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {status === 'in_progress' && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{progressPercent.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {status === 'completed' ? 'Completed' :
                       status === 'in_progress' ? 'In Progress' :
                       'Not Started'}
                    </span>

                    {status === 'not_started' && (
                      <Button size="sm" variant="primary">
                        Start
                      </Button>
                    )}
                    {status === 'in_progress' && (
                      <Button size="sm" variant="secondary">
                        Continue
                      </Button>
                    )}
                    {status === 'completed' && (
                      <Button size="sm" variant="secondary" disabled>
                        Claimed
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {quests.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-400">No tasks available right now. Check back later!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </PageLayout>
      <BottomNavigation />
    </>
  );
}
