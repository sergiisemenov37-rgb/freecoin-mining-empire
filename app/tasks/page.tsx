'use client';

import { useEffect, useState } from 'react';
import { PageLayout } from '@/components/ui/PageLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BottomNavigation } from '@/components/ui/BottomNavigation';
import { questService } from '@/services/QuestService';
import { useSession } from '@/hooks/useSession';
import { AssetManager } from '@/lib/assets/AssetManager';
import { motion } from 'framer-motion';
import AnimatedCounter from '@/components/ui/AnimatedCounter';

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
        {/* Quest Categories */}
        <motion.div 
          className="flex gap-2 mb-4 overflow-x-auto pb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {['Daily', 'Weekly', 'Special', 'Telegram', 'Social'].map((category, index) => (
            <motion.button
              key={category}
              className="cyber-card px-4 py-2 text-sm whitespace-nowrap"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {category}
            </motion.button>
          ))}
        </motion.div>

        <div className="space-y-4">
          {quests.map((quest) => {
            const status = getQuestStatus(quest.id);
            const progressPercent = getProgressPercent(quest.id);

            return (
              <motion.div
                key={quest.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="cyber-card p-4">
                  <div className="flex items-start gap-4">
                    <motion.div 
                      className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 border-cyan-500/30"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: 'spring' }}
                    >
                      <motion.img
                        src={AssetManager.resources.FREECOIN}
                        alt="Reward"
                        className="w-full h-full object-cover"
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                      />
                    </motion.div>
                    <div className="flex-1">
                      <motion.h3 
                        className="text-white font-bold text-lg mb-1"
                        whileHover={{ x: 5 }}
                        transition={{ type: 'spring' }}
                      >
                        {quest.name}
                      </motion.h3>
                      <p className="text-gray-400 text-sm mb-2">{quest.description}</p>
                      
                      {/* Progress Bar */}
                      {status === 'in_progress' && (
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Progress</span>
                            <motion.span
                              animate={{ opacity: [0.5, 1, 0.5] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            >
                              {progressPercent.toFixed(0)}%
                            </motion.span>
                          </div>
                          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-cyan-500 to-green-500"
                              initial={{ width: 0 }}
                              animate={{ width: `${progressPercent}%` }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <motion.div 
                          className="flex items-center gap-2"
                          animate={status === 'in_progress' ? {
                            boxShadow: ['0 0 10px rgba(0, 212, 255, 0.3)', '0 0 20px rgba(0, 212, 255, 0.5)', '0 0 10px rgba(0, 212, 255, 0.3)']
                          } : {}}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <img src={AssetManager.resources.FREECOIN} alt="" className="w-4 h-4" />
                          <motion.span 
                            className="text-yellow-400 font-bold text-lg neon-text"
                            animate={{ 
                              textShadow: ['0 0 10px #facc15', '0 0 20px #facc15', '0 0 10px #facc15']
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <AnimatedCounter value={quest.reward} />
                          </motion.span>
                        </motion.div>

                        {status === 'not_started' && (
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button size="sm" variant="primary">
                              <img src={AssetManager.actions.build} alt="" className="w-4 h-4 mr-1" />
                              Start
                            </Button>
                          </motion.div>
                        )}
                        {status === 'in_progress' && (
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button size="sm" variant="secondary">
                              <img src={AssetManager.actions.search} alt="" className="w-4 h-4 mr-1" />
                              Continue
                            </Button>
                          </motion.div>
                        )}
                        {status === 'completed' && (
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button size="sm" variant="success">
                              <img src={AssetManager.actions.claim} alt="" className="w-4 h-4 mr-1" />
                              Claim
                            </Button>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {quests.length === 0 && (
            <motion.div 
              className="cyber-card p-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.img
                src={AssetManager.status.loading}
                alt="No tasks"
                className="w-16 h-16 mx-auto mb-4"
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <p className="text-gray-400">No tasks available right now. Check back later!</p>
            </motion.div>
          )}
        </div>
      </PageLayout>
      <BottomNavigation />
    </>
  );
}
