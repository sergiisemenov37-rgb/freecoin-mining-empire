'use client';

import { PageLayout } from '@/components/ui/PageLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BottomNavigation } from '@/components/ui/BottomNavigation';
import { TonConnectButton } from '@tonconnect/ui-react';
import { useTonConnect } from '@/hooks/useTonConnect';

export default function Profile() {
  const { connected, formattedAddress, walletName, disconnectWallet, walletHistory, primaryWallet, setAsPrimary } = useTonConnect();

  return (
    <>
      <PageLayout title="Profile">
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">Manage your account settings.</p>
          </CardContent>
        </Card>

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

        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl">
                <div>
                  <p className="text-white font-medium">Telegram Stars</p>
                  <p className="text-gray-400 text-xs">Native Telegram payments</p>
                </div>
                <span className="text-yellow-400 text-sm">Coming Soon</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl">
                <div>
                  <p className="text-white font-medium">TON</p>
                  <p className="text-gray-400 text-xs">The Open Network</p>
                </div>
                <span className="text-yellow-400 text-sm">Coming Soon</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl">
                <div>
                  <p className="text-white font-medium">USDT (TON Jetton)</p>
                  <p className="text-gray-400 text-xs">Stablecoin on TON</p>
                </div>
                <span className="text-yellow-400 text-sm">Coming Soon</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </PageLayout>
      <BottomNavigation />
    </>
  );
}
