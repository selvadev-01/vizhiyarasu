import { Inter } from 'next/font/google'
import './globals.css'

// Inter is the single typeface used everywhere on the site. Loading it through
// next/font exposes a CSS variable (`--font-inter`) we can reference from any
// global CSS rule, while `inter.className` applies it as the default font on
// the body so every component inherits it automatically.
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export const metadata = {
  title: 'Vizhiyarasu Sampath — SDET',
  description:
    'SDET with 2+ years delivering quality across SaaS and ERP products — manual testing, automation, AI-assisted testing, and frontend development.',
  icons: {
    icon: '/icon.png',
  },
  openGraph: {
    title: 'Vizhiyarasu Sampath — SDET',
    description:
      'SDET with 2+ years delivering quality across SaaS and ERP products — manual testing, automation, AI-assisted testing, and frontend development.',
    type: 'website',
  },
}

// Tiny script that runs synchronously before the body paints. It reads the
// theme the user previously picked from localStorage and applies the
// corresponding `data-theme` attribute on the <html> element. Without this,
// the page would flash the wrong theme for one frame on every reload.
// Dark is the default: only an explicitly saved 'light' choice opts out, so
// a first-time visitor lands on dark.
const themeBootstrap = `
(function () {
  try {
    var saved = localStorage.getItem('theme');
    var theme = saved === 'light' ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme;
  } catch (e) {
    document.documentElement.dataset.theme = 'dark';
  }
})();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable} data-theme="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
