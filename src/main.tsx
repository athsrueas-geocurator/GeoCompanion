import { createRoot } from 'react-dom/client';
import App from './app/App';
import { PreferencesProvider } from './shared/preferences/Preferences';
import Coordination from './shared/coordination/Coordination';
createRoot(document.getElementById('root')!).render(
  <PreferencesProvider>
    <App />
    <Coordination />
  </PreferencesProvider>,
);
