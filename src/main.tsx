import { createRoot } from 'react-dom/client'
import { devSeed } from './lib/devSeed'
import App from './App.tsx'
import './index.css'

// Initialize dev seed before app starts
devSeed();

// Ensure demo user exists in dev
if (import.meta.env.DEV) {
  import('./lib/users').then(m => m.ensureDemoUser().catch(() => {}));
}

createRoot(document.getElementById("root")!).render(<App />);
