import type { Metadata } from 'next';
import './globals.css';
const title = 'LeadPredictor — Campaign Calculator';
const description = 'Turn your revenue goal into customer, lead, and prospect targets.';
export const metadata: Metadata = {
  metadataBase: new URL('https://lead-predictor-calculator.mim-fif.chatgpt.site'),
  title, description, icons: { icon: '/favicon.svg' },
  openGraph: { title, description, images: ['/og.png'] },
  twitter: { card: 'summary_large_image', title, description, images: ['/og.png'] },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
