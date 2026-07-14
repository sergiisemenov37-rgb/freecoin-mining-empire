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
        {/* Referral Section */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Invite Friends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-gray-400 text-sm">
                Invite friends and earn 10% of their mining rewards!
              </p>
              <div className="bg-gray-800 p-3 rounded-lg">
                <p className="text-gray-400 text-xs mb-1">Your referral link:</p>
                <p className="text-white text-sm font-mono break-all">{referralLink}</p>
              </div>
              <Button onClick={handleInvite} variant="primary" className="w-full">
                Copy Link & Invite
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-around">
              <motion.div 
                className="text-center"
                whileHover={{ scale: 1.1 }}
                transition={{ type: 'spring' }}
              >
                <motion.p 
                  className="text-white font-bold text-2xl"
                  animate={{ 
                    textShadow: ['0 0 10px rgba(34, 211, 238, 0.5)', '0 0 20px rgba(34, 211, 238, 0.8)', '0 0 10px rgba(34, 211, 238, 0.5)']
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <AnimatedCounter value={friends.length} />
                </motion.p>
                <p className="text-gray-400 text-xs">Friends</p>
              </motion.div>
              <motion.div 
                className="text-center"
                whileHover={{ scale: 1.1 }}
                transition={{ type: 'spring' }}
              >
                <motion.p 
                  className="text-white font-bold text-2xl"
                  animate={{ 
                    textShadow: ['0 0 10px rgba(250, 204, 21, 0.5)', '0 0 20px rgba(250, 204, 21, 0.8)', '0 0 10px rgba(250, 204, 21, 0.5)']
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <AnimatedCounter value={friendRequests.length} />
                </motion.p>
                <p className="text-gray-400 text-xs">Requests</p>
              </motion.div>
              <motion.div 
                className="text-center"
                whileHover={{ scale: 1.1 }}
                transition={{ type: 'spring' }}
              >
                <motion.p 
                  className="text-white font-bold text-2xl"
                  animate={{ 
                    textShadow: ['0 0 10px rgba(168, 85, 247, 0.5)', '0 0 20px rgba(168, 85, 247, 0.8)', '0 0 10px rgba(168, 85, 247, 0.5)']
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <AnimatedCounter value={0} />
                </motion.p>
                <p className="text-gray-400 text-xs">Referrals</p>
              </motion.div>
            </div>
          </CardContent>
        </Card>

        {/* Friend Requests */}
        {friendRequests.length > 0 && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Friend Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {friendRequests.map((request) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center justify-between p-3 bg-white/5 backdrop-blur border border-white/10 rounded-lg hover:border-cyan-500/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <motion.div 
                        className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: 'spring' }}
                      >
                        <img src={AssetManager.navigation.PROFILE} alt="Avatar" className="w-full h-full object-cover" />
                      </motion.div>
                      <div>
                        <p className="text-white font-medium">{request.requester_username || 'Unknown'}</p>
                        <p className="text-gray-400 text-xs">Wants to be friends</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button size="sm" variant="primary">
                          Accept
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button size="sm" variant="secondary">
                          Decline
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Friends List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Friends</CardTitle>
          </CardHeader>
          <CardContent>
            {friends.length > 0 ? (
              <div className="space-y-3">
                {friends.map((friend) => (
                  <motion.div
                    key={friend.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center justify-between p-3 bg-white/5 backdrop-blur border border-white/10 rounded-lg hover:border-cyan-500/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <motion.div 
                        className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden"
                        whileHover={{ scale: 1.1, rotate: -5 }}
                        transition={{ type: 'spring' }}
                      >
                        <img src={AssetManager.navigation.PROFILE} alt="Avatar" className="w-full h-full object-cover" />
                      </motion.div>
                      <div>
                        <p className="text-white font-medium">{friend.friend_username || 'Unknown'}</p>
                        <motion.p 
                          className="text-gray-400 text-xs"
                          animate={{ 
                            color: friend.status === 'accepted' ? ['#9ca3af', '#22c55e', '#9ca3af'] : ['#9ca3af', '#eab308', '#9ca3af']
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          {friend.status === 'accepted' ? 'Friend' : 'Pending'}
                        </motion.p>
                      </div>
                    </div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button size="sm" variant="ghost">
                        View
                      </Button>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div 
                className="text-center py-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="text-gray-400">No friends yet. Invite some!</p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </PageLayout>
      <BottomNavigation />
    </>
  );
}
