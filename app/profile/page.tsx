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
import { motion } from 'framer-motion';
import AnimatedCounter from '@/components/ui/AnimatedCounter';

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
        <motion.div 
          className="glass-panel p-6 mb-4 relative overflow-hidden"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-purple-500/10" />
          <div className="relative z-10 flex items-center gap-4">
            <motion.div 
              className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-cyan-500/50 shadow-lg shadow-cyan-500/20"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring' }}
            >
              <motion.img
                src={AssetManager.navigation.PROFILE}
                alt="Avatar"
                className="w-full h-full object-cover"
                animate={{ 
                  scale: [1, 1.05, 1],
                  filter: ['brightness(1)', 'brightness(1.2)', 'brightness(1)']
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </motion.div>
            <div className="flex-1">
              <motion.h2 
                className="text-2xl font-bold text-white neon-text mb-1"
                animate={{ 
                  textShadow: ['0 0 10px #00d4ff', '0 0 20px #00d4ff', '0 0 10px #00d4ff']
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {session?.username || 'Player'}
              </motion.h2>
              <p className="text-gray-400 text-sm mb-2">ID: {session?.player_id?.slice(0, 8)}...</p>
              <motion.div 
                className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 rounded-full"
                animate={{ 
                  boxShadow: ['0 0 10px rgba(0, 212, 255, 0.3)', '0 0 20px rgba(0, 212, 255, 0.5)', '0 0 10px rgba(0, 212, 255, 0.3)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <motion.img
                  src={AssetManager.resources.PREMIUM_TOKEN}
                  alt=""
                  className="w-4 h-4"
                  animate={{ rotate: [0, -360] }}
                  transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                />
                <span className="text-cyan-400 text-sm font-medium">Premium Member</span>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Empire Statistics */}
        <motion.div 
          className="glass-panel p-4 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <motion.h2 
            className="text-xl font-bold text-white neon-text mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            Empire Statistics
          </motion.h2>
          <div className="grid grid-cols-2 gap-3">
            <motion.div 
              className="cyber-card p-3 text-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <p className="text-gray-400 text-xs mb-1">Empire Level</p>
              <motion.p 
                className="text-cyan-400 font-bold text-2xl neon-text"
                animate={{ 
                  textShadow: ['0 0 10px #00d4ff', '0 0 20px #00d4ff', '0 0 10px #00d4ff']
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <AnimatedCounter value={empire?.level || 1} />
              </motion.p>
            </motion.div>
            <motion.div 
              className="cyber-card p-3 text-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <p className="text-gray-400 text-xs mb-1">Experience</p>
              <motion.p 
                className="text-green-400 font-bold text-2xl"
                animate={{ 
                  textShadow: ['0 0 10px #00ff88', '0 0 20px #00ff88', '0 0 10px #00ff88']
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <AnimatedCounter value={empire?.experience || 0} />
              </motion.p>
            </motion.div>
            <motion.div 
              className="cyber-card p-3 text-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <p className="text-gray-400 text-xs mb-1">Buildings</p>
              <motion.p 
                className="text-yellow-400 font-bold text-2xl"
                animate={{ 
                  textShadow: ['0 0 10px #facc15', '0 0 20px #facc15', '0 0 10px #facc15']
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <AnimatedCounter value={0} />
              </motion.p>
            </motion.div>
            <motion.div 
              className="cyber-card p-3 text-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <p className="text-gray-400 text-xs mb-1">Friends</p>
              <motion.p 
                className="text-purple-400 font-bold text-2xl"
                animate={{ 
                  textShadow: ['0 0 10px #9d4edd', '0 0 20px #9d4edd', '0 0 10px #9d4edd']
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <AnimatedCounter value={0} />
              </motion.p>
            </motion.div>
          </div>
        </motion.div>

        {/* Wallet Card */}
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
            Wallet Connection
          </motion.h2>
          {connected ? (
            <div className="space-y-4">
              <motion.div 
                className="cyber-card p-4 border-2 border-green-500/30"
                animate={{ 
                  boxShadow: ['0 0 10px rgba(34, 197, 94, 0.2)', '0 0 20px rgba(34, 197, 94, 0.4)', '0 0 10px rgba(34, 197, 94, 0.2)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="flex items-center justify-between mb-2">
                  <motion.div 
                    className="flex items-center gap-2"
                    animate={{ 
                      textShadow: ['0 0 10px #22c55e', '0 0 20px #22c55e', '0 0 10px #22c55e']
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <motion.img
                      src={AssetManager.status.online}
                      alt=""
                      className="w-4 h-4"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        filter: ['brightness(1)', 'brightness(1.5)', 'brightness(1)']
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <p className="text-green-400 font-medium">Connected</p>
                  </motion.div>
                  {primaryWallet === walletName && (
                    <motion.span 
                      className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full"
                      animate={{ 
                        boxShadow: ['0 0 5px #facc15', '0 0 15px #facc15', '0 0 5px #facc15']
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      Primary
                    </motion.span>
                  )}
                </div>
                <p className="text-gray-300 text-sm">Wallet: {walletName}</p>
                <p className="text-gray-400 text-xs font-mono mt-2">{formattedAddress}</p>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={disconnectWallet}
                  variant="danger"
                  className="w-full"
                >
                  Disconnect Wallet
                </Button>
              </motion.div>
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
            <div className="mt-6 pt-6 border-t border-cyan-500/20">
              <h3 className="text-white font-medium mb-3">Wallet History</h3>
              <div className="space-y-2">
                {walletHistory.map((wallet, index) => (
                  <motion.div
                    key={index}
                    className="cyber-card p-3"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white text-sm">{wallet.walletName}</p>
                        <p className="text-gray-400 text-xs font-mono">
                          {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                        </p>
                      </div>
                      {primaryWallet === wallet.address ? (
                        <motion.span 
                          className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full"
                          animate={{ 
                            boxShadow: ['0 0 5px #facc15', '0 0 15px #facc15', '0 0 5px #facc15']
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          Primary
                        </motion.span>
                      ) : (
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            onClick={() => setAsPrimary(wallet.address)}
                            variant="secondary"
                            size="sm"
                            className="text-xs"
                          >
                            Set Primary
                          </Button>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Settings */}
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
            Settings
          </motion.h2>
          <div className="space-y-3">
            <motion.div 
              className="cyber-card p-3"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Notifications</p>
                  <p className="text-gray-400 text-xs">Push notifications</p>
                </div>
                <motion.div 
                  className="w-12 h-6 bg-cyan-600 rounded-full relative cursor-pointer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <motion.div 
                    className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"
                    animate={{ 
                      boxShadow: ['0 0 5px #ffffff', '0 0 15px #ffffff', '0 0 5px #ffffff']
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
              </div>
            </motion.div>
            <motion.div 
              className="cyber-card p-3"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Sound Effects</p>
                  <p className="text-gray-400 text-xs">In-game sounds</p>
                </div>
                <motion.div 
                  className="w-12 h-6 bg-cyan-600 rounded-full relative cursor-pointer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <motion.div 
                    className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"
                    animate={{ 
                      boxShadow: ['0 0 5px #ffffff', '0 0 15px #ffffff', '0 0 5px #ffffff']
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
              </div>
            </motion.div>
            <motion.div 
              className="cyber-card p-3"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Language</p>
                  <p className="text-gray-400 text-xs">App language</p>
                </div>
                <motion.span 
                  className="text-cyan-400 text-sm font-medium"
                  animate={{ 
                    textShadow: ['0 0 10px #00d4ff', '0 0 20px #00d4ff', '0 0 10px #00d4ff']
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  English
                </motion.span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </PageLayout>
      <BottomNavigation />
    </>
  );
}
