import type {Metadata} from 'next';
import ReactDOM from 'react-dom';
import './globals.css'; // Global styles with local bundled fonts
import { CustomCursor } from '@/components/custom-cursor';
import { InitialAppLoader } from '@/components/ui/initial-app-loader';
import { DisableThemeTransitions } from '@/components/ui/disable-theme-transitions';

export const metadata: Metadata = {
  title: 'Ohmic - Parallel Resistor Lab',
  description: 'High-precision parallel resistor calculator with modern dark minimalist Park UI aesthetic.',
  openGraph: {
    title: 'Ohmic - Parallel Resistor Lab',
    description: 'High-precision parallel resistor calculator with modern dark minimalist Park UI aesthetic.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ohmic - Parallel Resistor Lab',
    description: 'High-precision parallel resistor calculator with modern dark minimalist Park UI aesthetic.',
  },
};

const isGithubPages = process.env.GITHUB_ACTIONS === 'true' || process.env.GITHUB_PAGES === 'true';
const fontBasePath = isGithubPages ? '/ohmic-resistor-lab' : '';

export default function RootLayout({children}: {children: React.ReactNode}) {
  ReactDOM.preload(`${fontBasePath}/fonts/vazirmatn-400.woff2`, {
    as: 'font',
    type: 'font/woff2',
    crossOrigin: 'anonymous',
  });
  ReactDOM.preload(`${fontBasePath}/fonts/kodemono-400.woff2`, {
    as: 'font',
    type: 'font/woff2',
    crossOrigin: 'anonymous',
  });

  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <DisableThemeTransitions />
        <InitialAppLoader />
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
