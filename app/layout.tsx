import type { Metadata, Viewport } from 'next';
import './globals.css';
import { TelegramProvider } from '@/components/providers/TelegramProvider';

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
      <body className="min-h-full flex flex-col">
        <TelegramProvider>{children}</TelegramProvider>
      </body>
    </html>
  );
}
