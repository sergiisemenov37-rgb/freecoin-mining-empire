'use client';

import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { ReactNode } from 'react';

interface TonConnectProviderProps {
  children: ReactNode;
}

export function TonConnectProvider({ children }: TonConnectProviderProps) {
  return (
    <TonConnectUIProvider
      manifestUrl="https://freecoin-mining-empire.vercel.app/tonconnect-manifest.json"
    >
      {children}
    </TonConnectUIProvider>
  );
}
