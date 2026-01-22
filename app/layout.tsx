// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { APP_NAME, APP_DESCRIPTION } from '@/lib/config/app';
// import { HelpCenterWidget } from '@/components/support/HelpCenterWidget'; // Part 4

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        {/* TODO: Add Header/Nav component */}
        {children}
        {/* <HelpCenterWidget />  // will be implemented in Part 4 */}
      </body>
    </html>
  );
}
