import './globals.css';
import PlayerRealtimeSync from '../components/PlayerRealtimeSync';
import PlayerToast from '../components/PlayerToast';
export const metadata = { title: 'Whiskay RPG — Open World Chronicle', description: 'Anime-inspired 3D dungeon RPG companion with ten floors, battle skills, inventory, and mobile landscape controls.' };
export const viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#070b17' };
export default function RootLayout({ children }) { return <html lang="id"><body>{children}<PlayerRealtimeSync /><PlayerToast /></body></html>; }
