'use client';

import { useEffect, useState } from 'react';
import { PageLayout } from '@/components/ui/PageLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BottomNavigation } from '@/components/ui/BottomNavigation';
import { friendService } from '@/services/FriendService';
import { useSession } from '@/hooks/useSession';
import { AssetManager } from '@/lib/assets/AssetManager';
import { motion } from 'framer-motion';
import AnimatedCounter from '@/components/ui/AnimatedCounter';

export default function Friends() {
  const { session } = useSession();
  const [friends, setFriends] = useState<any[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Generate referral link
  const referralLink = session?.player_id 
    ? `https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'FreeCoinWeb_bot'}?start=${session.player_id}`
    : '';

  useEffect(() => {
    if (!session?.player_id) return;

    const loadFriends = async () => {
      try {
        setLoading(true);
        const [friendsData, requestsData] = await Promise.all([
          friendService.getFriends(session.player_id),
          friendService.getFriendRequests(session.player_id),
        ]);

        setFriends(friendsData || []);
        setFriendRequests(requestsData || []);
      } catch (error) {
        console.error('Failed to load friends:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFriends();
  }, [session?.player_id]);

  const handleInvite = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      alert('Referral link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <>
        <PageLayout title="Friends">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-400">Loading friends...</div>
          </div>
        </PageLayout>
        <BottomNavigation />
      </>
    );
  }

  return (
    <>
      <PageLayout title="Friends">
        {/* Referral Banner */}
        <motion.div 
          className="glass-panel p-5 mb-4 relative overflow-hidden"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-purple-500/10" />
          <div className="relative z-10">
            <motion.div 
              className="flex items-center gap-4 mb-4"
              animate={{ 
                x: [0, 5, 0]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <motion.div
                className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-cyan-500/50 shadow-lg shadow-cyan-500/20"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring' }}
              >
                <img src={AssetManager.navigation.FRIENDS} alt="Referral" className="w-full h-full object-cover" />
              </motion.div>
              <div>
                <motion.h2 
                  className="text-xl font-bold text-white neon-text"
                  animate={{ 
                    textShadow: ['0 0 10px #00d4ff', '0 0 20px #00d4ff', '0 0 10px #00d4ff']
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Invite Friends
                </motion.h2>
                <p className="text-gray-400 text-sm">Earn rewards for each friend!</p>
              </div>
            </motion.div>
            <div className="bg-gray-900/50 border border-cyan-500/20 rounded-lg p-3 mb-3">
              <p className="text-gray-400 text-xs mb-1">Your referral link:</p>
              <p className="text-white text-sm font-mono break-all">{referralLink}</p>
            </div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button onClick={handleInvite} className="w-full" size="lg">
                <img src={AssetManager.actions.install} alt="" className="w-5 h-5 mr-2" />
                Copy Link & Invite
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Referral Statistics */}
        <motion.div 
          className="grid grid-cols-3 gap-3 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <motion.div 
            className="cyber-card p-3 text-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.p 
              className="text-white font-bold text-2xl neon-text"
              animate={{ 
                textShadow: ['0 0 10px #00d4ff', '0 0 20px #00d4ff', '0 0 10px #00d4ff']
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <AnimatedCounter value={friends.length} />
            </motion.p>
            <p className="text-gray-400 text-xs">Friends</p>
          </motion.div>
          <motion.div 
            className="cyber-card p-3 text-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.p 
              className="text-white font-bold text-2xl"
              animate={{ 
                textShadow: ['0 0 10px #facc15', '0 0 20px #facc15', '0 0 10px #facc15']
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <AnimatedCounter value={friendRequests.length} />
            </motion.p>
            <p className="text-gray-400 text-xs">Requests</p>
          </motion.div>
          <motion.div 
            className="cyber-card p-3 text-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.p 
              className="text-white font-bold text-2xl"
              animate={{ 
                textShadow: ['0 0 10px #9d4edd', '0 0 20px #9d4edd', '0 0 10px #9d4edd']
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <AnimatedCounter value={0} />
            </motion.p>
            <p className="text-gray-400 text-xs">Referrals</p>
          </motion.div>
        </motion.div>

        {/* Friend Requests */}
        {friendRequests.length > 0 && (
          <motion.div 
            className="glass-panel p-4 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.h2 
              className="text-xl font-bold text-white neon-text mb-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              Friend Requests
            </motion.h2>
            <div className="space-y-3">
              {friendRequests.map((request) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="cyber-card p-3"
                >
                  <div className="flex items-center gap-3">
                    <motion.div 
                      className="w-12 h-12 rounded-xl overflow-hidden border-2 border-cyan-500/30 flex-shrink-0"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: 'spring' }}
                    >
                      <img src={AssetManager.navigation.PROFILE} alt="Avatar" className="w-full h-full object-cover" />
                    </motion.div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{request.requester_username || 'Unknown'}</p>
                      <p className="text-gray-400 text-xs">Wants to be friends</p>
                    </div>
                    <div className="flex gap-2">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button size="sm" variant="success">
                          Accept
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button size="sm" variant="danger">
                          Decline
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Friends List */}
        <motion.div 
          className="glass-panel p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.h2 
            className="text-xl font-bold text-white neon-text mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            Your Friends
          </motion.h2>
          {friends.length > 0 ? (
            <div className="space-y-3">
              {friends.map((friend) => (
                <motion.div
                  key={friend.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="cyber-card p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <motion.div 
                        className="w-12 h-12 rounded-xl overflow-hidden border-2 border-cyan-500/30 flex-shrink-0"
                        whileHover={{ scale: 1.1, rotate: -5 }}
                        transition={{ type: 'spring' }}
                      >
                        <img src={AssetManager.navigation.PROFILE} alt="Avatar" className="w-full h-full object-cover" />
                      </motion.div>
                      <motion.div 
                        className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"
                        animate={{ 
                          boxShadow: ['0 0 5px #22c55e', '0 0 15px #22c55e', '0 0 5px #22c55e']
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{friend.friend_username || 'Unknown'}</p>
                      <div className="flex items-center gap-2">
                        <motion.p 
                          className="text-gray-400 text-xs"
                          animate={{ 
                            color: friend.status === 'accepted' ? ['#9ca3af', '#22c55e', '#9ca3af'] : ['#9ca3af', '#eab308', '#9ca3af']
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          {friend.status === 'accepted' ? 'Online' : 'Pending'}
                        </motion.p>
                        <motion.div
                          animate={{ 
                            opacity: [0.5, 1, 0.5]
                          }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <img src={AssetManager.resources.FREECOIN} alt="" className="w-3 h-3" />
                        </motion.div>
                        <span className="text-yellow-400 text-xs">+{Math.floor(Math.random() * 100)}/hr</span>
                      </div>
                    </div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button size="sm" variant="secondary">
                        <img src={AssetManager.actions.search} alt="" className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              className="text-center py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.img
                src={AssetManager.status.offline}
                alt="No friends"
                className="w-16 h-16 mx-auto mb-4"
                animate={{ 
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <p className="text-gray-400">No friends yet. Invite some!</p>
            </motion.div>
          )}
        </motion.div>
      </PageLayout>
      <BottomNavigation />
    </>
  );
}
