import { createRoot } from 'react-dom/client';
import App from './app/App';
import { PreferencesProvider } from './shared/preferences/Preferences';
createRoot(document.getElementById('root')!).render(
  <PreferencesProvider>
    <App />
  </PreferencesProvider>,
);
