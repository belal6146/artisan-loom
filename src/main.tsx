import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Auto-seed demo data in development
if (import.meta.env.DEV) {
  import("@/lib/devSeed").then(m => m.ensureDemoData?.()).catch(() => {});
}

createRoot(document.getElementById("root")!).render(<App />);
