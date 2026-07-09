import type { Metadata, Viewport } from 'next';
import './globals.css';
import { TelegramProvider } from '@/components/providers/TelegramProvider';
import { TonConnectProvider } from '@/components/providers/TonConnectProvider';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'FreeCoin: Mining Empire',
  description: 'A premium Telegram Mini App mining game',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <TonConnectProvider>
          <TelegramProvider>{children}</TelegramProvider>
        </TonConnectProvider>
      </body>
    </html>
  );
}
