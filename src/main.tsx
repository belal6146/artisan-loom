import { createRoot } from 'react-dom/client'
import { devSeed } from './lib/devSeed'
import App from './App.tsx'
import './index.css'

// Initialize dev seed before app starts
devSeed();

createRoot(document.getElementById("root")!).render(<App />);
