import './globals.css';
import PlayerRealtimeSync from '../components/PlayerRealtimeSync';
import PlayerToast from '../components/PlayerToast';
export const metadata = { title: 'Whiskay RPG Companion — Aetheria', applicationName: 'Whiskay RPG Companion', authors: [{ name: 'Arifi Razzaq' }], creator: 'Arifi Razzaq', publisher: 'Whiskay RPG Companion', description: 'Anime-inspired 3D open-world RPG companion integrated with WhiskayBot, server-owned player inventory, guilds, and dungeon progression.', keywords: ['Whiskay RPG', 'WhiskayBot', 'Aetheria', 'Open World RPG'], ...(process.env.NEXT_PUBLIC_SITE_URL ? { metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL), alternates: { canonical: '/' } } : {}), referrer: 'no-referrer', openGraph: { title: 'Whiskay RPG Companion — Aetheria', description: 'Explore Aetheria and Dungeonia with your linked WhiskayBot player.', type: 'website' } };
export const viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#070b17' };
export default function RootLayout({ children }) { return <html lang="id"><body>{children}<PlayerRealtimeSync /><PlayerToast /></body></html>; }
