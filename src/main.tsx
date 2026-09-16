import CachePanel from './shared/cache/CachePanel';
import { createRoot } from 'react-dom/client';
import App from './app/App';
import { PreferencesProvider } from './shared/preferences/Preferences';
import Coordination from './shared/coordination/Coordination';
import './app/theme.css';
import './app/mobile.css';
createRoot(document.getElementById('root')!).render(
  <PreferencesProvider>
    <App />
    <Coordination />
    <CachePanel />
  </PreferencesProvider>,
);
