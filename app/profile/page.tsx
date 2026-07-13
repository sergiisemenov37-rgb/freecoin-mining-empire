'use client';

import { useEffect, useState } from 'react';
import { PageLayout } from '@/components/ui/PageLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BottomNavigation } from '@/components/ui/BottomNavigation';
import { TonConnectButton } from '@tonconnect/ui-react';
import { useTonConnect } from '@/hooks/useTonConnect';
import { useSession } from '@/hooks/useSession';
import { playerService } from '@/services/PlayerService';
import { EmpireService } from '@/lib/supabase/services/empireService';
import { AssetManager } from '@/lib/assets/AssetManager';

export default function Profile() {
  const { session } = useSession();
  const { connected, formattedAddress, walletName, disconnectWallet, walletHistory, primaryWallet, setAsPrimary } = useTonConnect();
  const [playerProfile, setPlayerProfile] = useState<any>(null);
  const [empire, setEmpire] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.player_id) return;

    const loadProfileData = async () => {
      try {
        setLoading(true);
        const [profile, empireData] = await Promise.all([
          playerService.getProfile(session.player_id),
          EmpireService.getEmpireByPlayerId(session.player_id),
        ]);

        setPlayerProfile(profile);
        setEmpire(empireData);
      } catch (error) {
        console.error('Failed to load profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [session?.player_id]);

  if (loading) {
    return (
      <>
        <PageLayout title="Profile">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-400">Loading profile...</div>
          </div>
        </PageLayout>
        <BottomNavigation />
      </>
    );
  }

  return (
    <>
      <PageLayout title="Profile">
        {/* Profile Header */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
                <img src={AssetManager.navigation.PROFILE} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h2 className="text-white font-bold text-lg">{session?.username || 'Player'}</h2>
                <p className="text-gray-400 text-sm">ID: {session?.player_id?.slice(0, 8)}...</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-800 rounded-lg">
                <p className="text-gray-400 text-xs">Empire Level</p>
                <p className="text-white font-bold text-xl">{empire?.level || 1}</p>
              </div>
              <div className="p-3 bg-gray-800 rounded-lg">
                <p className="text-gray-400 text-xs">Experience</p>
                <p className="text-white font-bold text-xl">{empire?.experience || 0}</p>
              </div>
              <div className="p-3 bg-gray-800 rounded-lg">
                <p className="text-gray-400 text-xs">Buildings</p>
                <p className="text-white font-bold text-xl">0</p>
              </div>
              <div className="p-3 bg-gray-800 rounded-lg">
                <p className="text-gray-400 text-xs">Friends</p>
                <p className="text-white font-bold text-xl">0</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wallet Connection */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Wallet Connection</CardTitle>
          </CardHeader>
          <CardContent>
            {connected ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-green-400 font-medium">Connected</p>
                    {primaryWallet === walletName && (
                      <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">Primary</span>
                    )}
                  </div>
                  <p className="text-gray-300 text-sm">Wallet: {walletName}</p>
                  <p className="text-gray-400 text-xs font-mono mt-2">{formattedAddress}</p>
                </div>
                <Button
                  onClick={disconnectWallet}
                  variant="secondary"
                  className="w-full"
                >
                  Disconnect Wallet
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-400 text-sm mb-4">
                  Connect your TON wallet to enable payments and transactions.
                </p>
                <div className="flex flex-col gap-2">
                  <TonConnectButton className="w-full" />
                  <p className="text-gray-500 text-xs text-center mt-2">
                    Supports: Telegram Wallet, Tonkeeper, MyTonWallet, Tonhub, OpenMask
                  </p>
                </div>
              </div>
            )}

            {walletHistory.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-700">
                <h3 className="text-white font-medium mb-3">Wallet History</h3>
                <div className="space-y-2">
                  {walletHistory.map((wallet, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl"
                    >
                      <div>
                        <p className="text-white text-sm">{wallet.walletName}</p>
                        <p className="text-gray-400 text-xs font-mono">
                          {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                        </p>
                      </div>
                      {primaryWallet === wallet.address ? (
                        <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">Primary</span>
                      ) : (
                        <Button
                          onClick={() => setAsPrimary(wallet.address)}
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                        >
                          Set Primary
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl">
                <div>
                  <p className="text-white font-medium">Notifications</p>
                  <p className="text-gray-400 text-xs">Push notifications</p>
                </div>
                <div className="w-12 h-6 bg-blue-600 rounded-full relative">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl">
                <div>
                  <p className="text-white font-medium">Sound Effects</p>
                  <p className="text-gray-400 text-xs">In-game sounds</p>
                </div>
                <div className="w-12 h-6 bg-blue-600 rounded-full relative">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl">
                <div>
                  <p className="text-white font-medium">Language</p>
                  <p className="text-gray-400 text-xs">App language</p>
                </div>
                <span className="text-gray-400 text-sm">English</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </PageLayout>
      <BottomNavigation />
    </>
  );
}
