'use client';

import { useEffect, useState } from 'react';
import { PageLayout } from '@/components/ui/PageLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BottomNavigation } from '@/components/ui/BottomNavigation';
import { friendService } from '@/services/FriendService';
import { useSession } from '@/hooks/useSession';
import { AssetManager } from '@/lib/assets/AssetManager';

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
              <div className="text-center">
                <p className="text-white font-bold text-2xl">{friends.length}</p>
                <p className="text-gray-400 text-xs">Friends</p>
              </div>
              <div className="text-center">
                <p className="text-white font-bold text-2xl">{friendRequests.length}</p>
                <p className="text-gray-400 text-xs">Requests</p>
              </div>
              <div className="text-center">
                <p className="text-white font-bold text-2xl">0</p>
                <p className="text-gray-400 text-xs">Referrals</p>
              </div>
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
                  <div key={request.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                        <img src={AssetManager.navigation.PROFILE} alt="Avatar" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{request.requester_username || 'Unknown'}</p>
                        <p className="text-gray-400 text-xs">Wants to be friends</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="primary">
                        Accept
                      </Button>
                      <Button size="sm" variant="secondary">
                        Decline
                      </Button>
                    </div>
                  </div>
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
                  <div key={friend.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                        <img src={AssetManager.navigation.PROFILE} alt="Avatar" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{friend.friend_username || 'Unknown'}</p>
                        <p className="text-gray-400 text-xs">
                          {friend.status === 'accepted' ? 'Friend' : 'Pending'}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">
                      View
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">No friends yet. Invite some!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </PageLayout>
      <BottomNavigation />
    </>
  );
}
